import {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodeListSearchResult,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

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
					default: 100,
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
						.filter((model: any) => {
							// Include models that support chat completions
							const modelId = model.id || model.model || '';
							return modelId && !modelId.includes('embed') && !modelId.includes('rerank');
						})
						.map((model: any) => {
							const modelId = model.id || model.model || '';
							
							// Format model name: meta/llama-3.1-8b-instruct → Llama 3.1 8B Instruct
							const parts = modelId.split('/');
							const modelName = parts[parts.length - 1];
							const displayName = modelName
								.split('-')
								.map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
								.join(' ')
								.replace(/\d+b\b/gi, (match: string) => match.toUpperCase())
								.replace(/\d+k\b/gi, (match: string) => match.toUpperCase());
							
							return {
								name: displayName,
								value: modelId,
								description: model.description || `${displayName} model`,
							};
						})
						.sort((a: any, b: any) => a.name.localeCompare(b.name));

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

		// Process each input item
		for (let i = 0; i < items.length; i++) {
			try {
				// Handle resourceLocator format for model parameter
				const modelResource = this.getNodeParameter('model', i) as { mode: string; value: string };
				const model = modelResource.value || modelResource as any as string;
				const messagesData = this.getNodeParameter('messages', i) as any;
				const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as any;

				// Build messages array
				const messages = messagesData.messageValues?.map((msg: any) => ({
					role: msg.role,
					content: msg.content,
				})) || [];

				// Validate messages array is not empty
				if (messages.length === 0) {
					throw new NodeOperationError(
						this.getNode(),
						'At least one message is required. Please add a message in the Messages field.',
						{ itemIndex: i },
					);
				}

				// Validate that all messages have non-empty content
				const emptyMessageIndex = messages.findIndex((msg: any) => !msg.content || msg.content.trim() === '');
				if (emptyMessageIndex !== -1) {
					throw new NodeOperationError(
						this.getNode(),
						`Message ${emptyMessageIndex + 1} has empty content. All messages must have at least 1 character.`,
						{ itemIndex: i },
					);
				}

				// Prepend system prompt to first user message if provided
				if (additionalOptions.system_prompt) {
					const firstUserIndex = messages.findIndex((msg: any) => msg.role === 'user');
					if (firstUserIndex !== -1) {
						messages[firstUserIndex].content = `${additionalOptions.system_prompt}\n\n${messages[firstUserIndex].content}`;
					}
				}

				// Prepare request body
				const body: any = { model, messages };

				// Add additional options efficiently
				const optionMappings: Record<string, string> = {
					max_tokens: 'max_tokens',
					temperature: 'temperature',
					top_p: 'top_p',
					frequency_penalty: 'frequency_penalty',
					presence_penalty: 'presence_penalty',
					stream: 'stream',
				};

				for (const [key, bodyKey] of Object.entries(optionMappings)) {
					if (additionalOptions[key] !== undefined) {
						body[bodyKey] = additionalOptions[key];
					}
				}

				// Handle stop sequences specially
				if (additionalOptions.stop) {
					body.stop = additionalOptions.stop.split(',').map((s: string) => s.trim());
				}

				// Make API request
				const responseData = await this.helpers.requestWithAuthentication.call(
					this,
					'nvidiaNimApi',
					{
						method: 'POST',
						baseURL: (await this.getCredentials('nvidiaNimApi')).baseUrl as string,
						url: '/chat/completions',
						body,
						json: true,
					},
				);

				// Add to return data with proper item linking
				returnData.push({
					json: responseData,
					pairedItem: { item: i },
				});

			} catch (error) {
				// Handle errors gracefully
				if (this.continueOnFail()) {
					const errorMessage = error instanceof Error ? error.message : String(error);
					returnData.push({
						json: {
							error: errorMessage,
							item: i,
						},
						pairedItem: { item: i },
					});
					continue;
				}
				const errorObj = error instanceof Error ? error : new Error(String(error));
				throw new NodeOperationError(this.getNode(), errorObj, { itemIndex: i });
			}
		}

		return [returnData];
	}
}
