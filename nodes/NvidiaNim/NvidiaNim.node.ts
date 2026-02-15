import {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodeListSearchResult,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

// TypeScript interfaces for better type safety
interface NvidiaModel {
	id?: string;
	model?: string;
	description?: string;
}

interface ChatMessage {
	role: 'user' | 'assistant';
	content: string;
}

interface AdditionalOptions {
	frequency_penalty?: number;
	max_tokens?: number;
	presence_penalty?: number;
	stop?: string;
	stream?: boolean;
	system_prompt?: string;
	temperature?: number;
	top_p?: number;
}

// Helper function to format model names
function formatModelName(modelId: string): string {
	const parts = modelId.split('/');
	const modelName = parts[parts.length - 1];
	
	// Create a map for special replacements
	const specialReplacements: Record<string, string> = {
		'llama': 'Llama',
		'mixtral': 'Mixtral',
		'mistral': 'Mistral',
		'meta': 'Meta',
	};
	
	return modelName
		.split('-')
		.map(word => {
			// Handle special cases first
			const lowerWord = word.toLowerCase();
			if (specialReplacements[lowerWord]) {
				return specialReplacements[lowerWord];
			}
			// Handle numeric suffixes
			if (/^\d+[bk]$/i.test(word)) {
				return word.toUpperCase();
			}
			// Default capitalization
			return word.charAt(0).toUpperCase() + word.slice(1);
		})
		.join(' ');
}

// Helper function to map additional options
function mapAdditionalOptions(additionalOptions: AdditionalOptions): Record<string, any> {
	const mappedOptions: Record<string, any> = {};
	
	// Define mapping with type information
	const mappings = [
		{ source: 'max_tokens', target: 'max_tokens', type: 'number' },
		{ source: 'temperature', target: 'temperature', type: 'number' },
		{ source: 'top_p', target: 'top_p', type: 'number' },
		{ source: 'frequency_penalty', target: 'frequency_penalty', type: 'number' },
		{ source: 'presence_penalty', target: 'presence_penalty', type: 'number' },
		{ source: 'stream', target: 'stream', type: 'boolean' }
	] as const;
	
	for (const { source, target } of mappings) {
		if (additionalOptions[source] !== undefined) {
			mappedOptions[target] = additionalOptions[source];
		}
	}
	
	// Handle special cases
	if (additionalOptions.stop) {
		mappedOptions.stop = additionalOptions.stop.split(',').map(s => s.trim());
	}
	
	return mappedOptions;
}

// Helper function to validate messages
function validateMessages(messages: ChatMessage[]): { isValid: boolean; error?: string; errorIndex?: number } {
	// Validate messages array is not empty
	if (messages.length === 0) {
		return { isValid: false, error: 'At least one message is required. Please add a message in the Messages field.' };
	}

	// Validate that all messages have non-empty content
	const emptyMessageIndex = messages.findIndex(msg => !msg.content || msg.content.trim() === '');
	if (emptyMessageIndex !== -1) {
		return { 
			isValid: false, 
			error: `Message ${emptyMessageIndex + 1} has empty content. All messages must have at least 1 character.`,
			errorIndex: emptyMessageIndex
		};
	}

	return { isValid: true };
}

// Helper function to preprocess messages
function preprocessMessages(messages: ChatMessage[], systemPrompt?: string): ChatMessage[] {
	const processedMessages = [...messages];

	// Prepend system prompt to first user message if provided
	if (systemPrompt) {
		const firstUserIndex = processedMessages.findIndex(msg => msg.role === 'user');
		if (firstUserIndex !== -1) {
			processedMessages[firstUserIndex] = {
				...processedMessages[firstUserIndex],
				content: `${systemPrompt}\n\n${processedMessages[firstUserIndex].content}`
			};
		}
	}

	return processedMessages;
}

export class NvidiaNim implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'NVIDIA NIM',
		name: 'nvidiaNim',
		icon: 'file:nvidia-nim.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["model"]}}',
		description: 'Chat with NVIDIA NIM AI models - Simple conversational AI',
		defaults: {
			name: 'NVIDIA NIM',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'nvidiaNimApi',
				required: true,
			},
		],
		properties: [
			// ==================== MODEL SELECTION ====================
			{
				displayName: 'Model',
				name: 'model',
				type: 'resourceLocator',
				default: { mode: 'list', value: 'meta/llama-3.1-8b-instruct' },
				required: true,
				description: 'Select the NVIDIA NIM model to use for chat completions',
				modes: [
					{
						displayName: 'From List',
						name: 'list',
						type: 'list',
						typeOptions: {
							searchListMethod: 'getModels',
							searchable: true,
						},
					},
					{
						displayName: 'By ID',
						name: 'id',
						type: 'string',
						validation: [
							{
								type: 'regex',
								properties: {
									regex: '^[a-zA-Z0-9_-]+/[a-zA-Z0-9_.-]+$',
									errorMessage: 'Model ID must be in format: owner/model-name',
								},
							},
						],
						placeholder: 'e.g., meta/llama-3.1-8b-instruct',
					},
				],
			},
			{
				displayName: 'Messages',
				name: 'messages',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				description: 'The conversation messages',
				options: [
					{
						name: 'messageValues',
						displayName: 'Message',
						values: [
							{
								displayName: 'Role',
								name: 'role',
								type: 'options',
								options: [
									{
										name: 'User',
										value: 'user',
										description: 'User messages or questions',
									},
									{
										name: 'Assistant',
										value: 'assistant',
										description: 'AI assistant previous responses (for conversation history)',
									},
								],
								default: 'user',
								description: 'The role of the message sender',
							},
							{
								displayName: 'Content',
								name: 'content',
								type: 'string',
								typeOptions: {
									rows: 4,
								},
								default: '',
								description: 'The message content',
								placeholder: 'Enter your message here',
							},
						],
					},
				],
			},

			// ==================== ADDITIONAL OPTIONS ====================
			{
				displayName: 'Additional Options',
				name: 'additionalOptions',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Frequency Penalty',
						name: 'frequency_penalty',
						type: 'number',
						typeOptions: {
							minValue: -2,
							maxValue: 2,
							numberPrecision: 2,
						},
						default: 0,
						description: 'Reduces repetition. Positive values penalize frequent tokens (-2 to 2).',
					},
					{
						displayName: 'Max Tokens',
						name: 'max_tokens',
						type: 'number',
						default: 1024,
						description: 'Maximum number of tokens to generate in the response',
						typeOptions: {
							minValue: 1,
							maxValue: 4096,
						},
					},
					{
						displayName: 'Presence Penalty',
						name: 'presence_penalty',
						type: 'number',
						typeOptions: {
							minValue: -2,
							maxValue: 2,
							numberPrecision: 2,
						},
						default: 0,
						description: 'Encourages new topics. Positive values penalize existing tokens (-2 to 2).',
					},
					{
						displayName: 'Stop Sequences',
						name: 'stop',
						type: 'string',
						default: '',
						description: 'Comma-separated sequences where the API will stop generating (e.g., "\\n,END")',
						placeholder: '\\n,END',
					},
					{
						displayName: 'Stream',
						name: 'stream',
						type: 'boolean',
						default: false,
						description: 'Whether to stream the response (not fully supported in all contexts)',
					},
					{
						displayName: 'System Prompt',
						name: 'system_prompt',
						type: 'string',
						typeOptions: {
							rows: 3,
						},
						default: '',
						description: 'System instructions to guide the AI behavior. Will be prepended to the first user message.',
						placeholder: 'You are a helpful assistant...',
					},
					{
						displayName: 'Temperature',
						name: 'temperature',
						type: 'number',
						typeOptions: {
							minValue: 0,
							maxValue: 2,
							numberPrecision: 2,
						},
						default: 0.7,
						description: 'Controls randomness. Lower = more focused, Higher = more creative (0-2).',
					},
					{
						displayName: 'Top P',
						name: 'top_p',
						type: 'number',
						typeOptions: {
							minValue: 0,
							maxValue: 1,
							numberPrecision: 2,
						},
						default: 1,
						description: 'Nucleus sampling parameter. Controls diversity of output (0-1).',
					},
				],
			},
		],
	};

	methods = {
		listSearch: {
			async getModels(this: ILoadOptionsFunctions): Promise<INodeListSearchResult> {
				try {
					const credentials = await this.getCredentials('nvidiaNimApi');
					const baseUrl = credentials.baseUrl as string;
					const apiKey = credentials.apiKey as string;

					// Fetch available models from NVIDIA NIM API
					const response = await this.helpers.httpRequest({
						method: 'GET',
						url: `${baseUrl}/models`,
						headers: {
							'Authorization': `Bearer ${apiKey}`,
							'Content-Type': 'application/json',
						},
					});

					const models = response.data || [];
					
					// Filter for chat/completion models and format for n8n
					const results = models
						.filter((model: NvidiaModel) => {
							// Include models that support chat completions
							const modelId = model.id || model.model || '';
							return modelId && !modelId.includes('embed') && !modelId.includes('rerank');
						})
						.map((model: NvidiaModel) => {
							const modelId = model.id || model.model || '';
							
							// Format model name: meta/llama-3.1-8b-instruct → Llama 3.1 8B Instruct
							const displayName = formatModelName(modelId);
							
							return {
								name: displayName,
								value: modelId,
								description: model.description || `${displayName} model`,
							};
						})
						.sort((a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name));

					return {
						results,
					};
				} catch (error) {
					// Fallback to default models if API fails
					return {
						results: [
							{ name: 'Llama 3.1 8B Instruct', value: 'meta/llama-3.1-8b-instruct' },
							{ name: 'Llama 3.1 70B Instruct', value: 'meta/llama-3.1-70b-instruct' },
							{ name: 'Llama 3.1 405B Instruct', value: 'meta/llama-3.1-405b-instruct' },
							{ name: 'Mixtral 8x7B Instruct', value: 'mistralai/mixtral-8x7b-instruct-v0.1' },
						],
					};
				}
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		// Fetch credentials once and reuse
		const credentials = await this.getCredentials('nvidiaNimApi');
		const baseUrl = credentials.baseUrl as string;

		// Process each input item
		for (let i = 0; i < items.length; i++) {
			let model: string = 'unknown';
			
			try {
				// Handle resourceLocator format for model parameter
				const modelResource = this.getNodeParameter('model', i) as { mode: string; value: string | undefined };
				if (typeof modelResource === 'object' && modelResource.value) {
					model = modelResource.value;
				} else if (typeof modelResource === 'string') {
					model = modelResource;
				} else {
					throw new NodeOperationError(this.getNode(), 'Invalid model parameter', { itemIndex: i });
				}
				const messagesData = this.getNodeParameter('messages', i) as any;
				const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as AdditionalOptions;

				// Build messages array
				const messages: ChatMessage[] = messagesData.messageValues?.map((msg: any) => ({
					role: msg.role,
					content: msg.content,
				})) || [];

				// Validate messages
				const validation = validateMessages(messages);
				if (!validation.isValid) {
					throw new NodeOperationError(
						this.getNode(),
						validation.error!,
						{ itemIndex: i },
					);
				}

				// Preprocess messages
				const processedMessages = preprocessMessages(messages, additionalOptions.system_prompt);

				// Prepare request body
				const body: any = { 
					model, 
					messages: processedMessages 
				};

				// Add additional options
				Object.assign(body, mapAdditionalOptions(additionalOptions));

				// Make API request
				const responseData = await this.helpers.requestWithAuthentication.call(
					this,
					'nvidiaNimApi',
					{
						method: 'POST',
						baseURL: baseUrl,
						url: '/chat/completions',
						body,
						json: true,
						timeout: 120000,
					},
				);

				// Add to return data with proper item linking
				returnData.push({
					json: { ...responseData },
					pairedItem: { item: i },
				});

			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : String(error);
				
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: errorMessage,
							item: i,
							model,
							timestamp: new Date().toISOString(),
						},
						pairedItem: { item: i },
					});
					continue;
				}
				throw new NodeOperationError(
					this.getNode(),
					`Failed to process request: ${errorMessage}`,
					{ itemIndex: i },
				);
			}
		}

		return [returnData];
	}
}
