import {
	IExecuteFunctions,
	INodeExecutionData,
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
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with NVIDIA NIM AI models for chat, completions, and embeddings',
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
			// ==================== RESOURCE ====================
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Chat',
						value: 'chat',
						description: 'Create chat completions with conversation context',
					},
					{
						name: 'Completion',
						value: 'completion',
						description: 'Generate text completions from prompts',
					},
					{
						name: 'Embedding',
						value: 'embedding',
						description: 'Generate embeddings for text inputs',
					},
					{
						name: 'Model',
						value: 'model',
						description: 'List and manage available models',
					},
				],
				default: 'chat',
			},

			// ==================== CHAT OPERATIONS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['chat'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a chat completion',
						action: 'Create a chat completion',
					},
				],
				default: 'create',
			},

			// ==================== COMPLETION OPERATIONS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['completion'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a text completion',
						action: 'Create a text completion',
					},
				],
				default: 'create',
			},

			// ==================== EMBEDDING OPERATIONS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['embedding'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create embeddings for text',
						action: 'Create embeddings',
					},
				],
				default: 'create',
			},

			// ==================== MODEL OPERATIONS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['model'],
					},
				},
				options: [
					{
						name: 'List',
						value: 'list',
						description: 'List all available models',
						action: 'List available models',
					},
				],
				default: 'list',
			},

			// ==================== CHAT FIELDS ====================
			{
				displayName: 'Model',
				name: 'model',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['chat'],
						operation: ['create'],
					},
				},
				default: 'meta/llama3-8b-instruct',
				required: true,
				description: 'The AI model to use. Common options: meta/llama3-8b-instruct, meta/llama3-70b-instruct',
				placeholder: 'meta/llama3-8b-instruct',
			},
			{
				displayName: 'Messages',
				name: 'messages',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				displayOptions: {
					show: {
						resource: ['chat'],
						operation: ['create'],
					},
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
										name: 'System',
										value: 'system',
										description: 'System instructions that guide the AI behavior',
									},
									{
										name: 'User',
										value: 'user',
										description: 'User messages or questions',
									},
									{
										name: 'Assistant',
										value: 'assistant',
										description: 'AI assistant responses (for context)',
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

			// ==================== COMPLETION FIELDS ====================
			{
				displayName: 'Model',
				name: 'model',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['completion'],
						operation: ['create'],
					},
				},
				default: 'meta/llama3-8b-instruct',
				required: true,
				description: 'The AI model to use for text completion',
				placeholder: 'meta/llama3-8b-instruct',
			},
			{
				displayName: 'Prompt',
				name: 'prompt',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				displayOptions: {
					show: {
						resource: ['completion'],
						operation: ['create'],
					},
				},
				default: '',
				required: true,
				description: 'The prompt to generate completions for',
				placeholder: 'Once upon a time...',
			},

			// ==================== EMBEDDING FIELDS ====================
			{
				displayName: 'Model',
				name: 'model',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['embedding'],
						operation: ['create'],
					},
				},
				default: 'nvidia/nv-embed-v1',
				required: true,
				description: 'The embedding model to use',
				placeholder: 'nvidia/nv-embed-v1',
			},
			{
				displayName: 'Input',
				name: 'input',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				displayOptions: {
					show: {
						resource: ['embedding'],
						operation: ['create'],
					},
				},
				default: '',
				required: true,
				description: 'The text to create embeddings for',
				placeholder: 'Enter text to embed',
			},

			// ==================== ADDITIONAL OPTIONS ====================
			{
				displayName: 'Additional Options',
				name: 'additionalOptions',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: {
					show: {
						resource: ['chat', 'completion'],
					},
				},
				options: [
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
						displayName: 'Temperature',
						name: 'temperature',
						type: 'number',
						typeOptions: {
							minValue: 0,
							maxValue: 2,
							numberPrecision: 2,
						},
						default: 0.7,
						description: 'Controls randomness. Lower = more focused, Higher = more creative (0-2)',
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
						description: 'Nucleus sampling parameter. Controls diversity of output (0-1)',
					},
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
						description: 'Reduces repetition. Positive values penalize frequent tokens (-2 to 2)',
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
						description: 'Encourages new topics. Positive values penalize existing tokens (-2 to 2)',
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
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		// Process each input item
		for (let i = 0; i < items.length; i++) {
			try {
				let responseData;

				// ==================== CHAT ====================
				if (resource === 'chat') {
					if (operation === 'create') {
						const model = this.getNodeParameter('model', i) as string;
						const messagesData = this.getNodeParameter('messages', i) as any;
						const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as any;

						// Build messages array
						const messages = messagesData.messageValues?.map((msg: any) => ({
							role: msg.role,
							content: msg.content,
						})) || [];

						// Prepare request body
						const body: any = {
							model,
							messages,
						};

						// Add additional options
						if (additionalOptions.max_tokens) body.max_tokens = additionalOptions.max_tokens;
						if (additionalOptions.temperature !== undefined) body.temperature = additionalOptions.temperature;
						if (additionalOptions.top_p !== undefined) body.top_p = additionalOptions.top_p;
						if (additionalOptions.frequency_penalty !== undefined) body.frequency_penalty = additionalOptions.frequency_penalty;
						if (additionalOptions.presence_penalty !== undefined) body.presence_penalty = additionalOptions.presence_penalty;
						if (additionalOptions.stream !== undefined) body.stream = additionalOptions.stream;
						if (additionalOptions.stop) {
							body.stop = additionalOptions.stop.split(',').map((s: string) => s.trim());
						}

						// Make API request
						responseData = await this.helpers.requestWithAuthentication.call(
							this,
							'nvidiaNimApi',
							{
								method: 'POST',
								url: '/chat/completions',
								body,
								json: true,
							},
						);
					}
				}

				// ==================== COMPLETION ====================
				else if (resource === 'completion') {
					if (operation === 'create') {
						const model = this.getNodeParameter('model', i) as string;
						const prompt = this.getNodeParameter('prompt', i) as string;
						const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as any;

						// Prepare request body
						const body: any = {
							model,
							prompt,
						};

						// Add additional options
						if (additionalOptions.max_tokens) body.max_tokens = additionalOptions.max_tokens;
						if (additionalOptions.temperature !== undefined) body.temperature = additionalOptions.temperature;
						if (additionalOptions.top_p !== undefined) body.top_p = additionalOptions.top_p;
						if (additionalOptions.frequency_penalty !== undefined) body.frequency_penalty = additionalOptions.frequency_penalty;
						if (additionalOptions.presence_penalty !== undefined) body.presence_penalty = additionalOptions.presence_penalty;
						if (additionalOptions.stream !== undefined) body.stream = additionalOptions.stream;
						if (additionalOptions.stop) {
							body.stop = additionalOptions.stop.split(',').map((s: string) => s.trim());
						}

						// Make API request
						responseData = await this.helpers.requestWithAuthentication.call(
							this,
							'nvidiaNimApi',
							{
								method: 'POST',
								url: '/completions',
								body,
								json: true,
							},
						);
					}
				}

				// ==================== EMBEDDING ====================
				else if (resource === 'embedding') {
					if (operation === 'create') {
						const model = this.getNodeParameter('model', i) as string;
						const input = this.getNodeParameter('input', i) as string;

						const body = {
							model,
							input,
						};

						// Make API request
						responseData = await this.helpers.requestWithAuthentication.call(
							this,
							'nvidiaNimApi',
							{
								method: 'POST',
								url: '/embeddings',
								body,
								json: true,
							},
						);
					}
				}

				// ==================== MODEL ====================
				else if (resource === 'model') {
					if (operation === 'list') {
						// Make API request
						responseData = await this.helpers.requestWithAuthentication.call(
							this,
							'nvidiaNimApi',
							{
								method: 'GET',
								url: '/models',
								json: true,
							},
						);
					}
				}

				// Add to return data with proper item linking
				returnData.push({
					json: responseData,
					pairedItem: { item: i },
				});

			} catch (error) {
				// Handle errors gracefully
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error.message,
							item: i,
						},
						pairedItem: { item: i },
					});
					continue;
				}
				throw new NodeOperationError(this.getNode(), error, { itemIndex: i });
			}
		}

		return [returnData];
	}
}
