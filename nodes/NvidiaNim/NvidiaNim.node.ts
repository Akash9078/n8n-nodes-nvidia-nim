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
		subtitle: '={{$parameter["model"]}}',
		description: 'Chat with NVIDIA NIM AI models - Use with tools, memory, and function calling',
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
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Gemma 2 27B Instruct',
						value: 'google/gemma-2-27b-it',
						description: 'Larger Google model',
					},
					{
						name: 'Gemma 2 9B Instruct',
						value: 'google/gemma-2-9b-it',
						description: 'Google\'s efficient model',
					},
					{
						name: 'Llama 3.1 405B Instruct',
						value: 'meta/llama-3.1-405b-instruct',
						description: 'Maximum capability and performance',
					},
					{
						name: 'Llama 3.1 70B Instruct',
						value: 'meta/llama-3.1-70b-instruct',
						description: 'More capable, better reasoning',
					},
					{
						name: 'Llama 3.1 8B Instruct',
						value: 'meta/llama-3.1-8b-instruct',
						description: 'Fast and efficient for most tasks',
					},
					{
						name: 'Llama 3.2 3B Instruct',
						value: 'meta/llama-3.2-3b-instruct',
						description: 'Ultra-fast, lightweight model',
					},
					{
						name: 'Llama 3.2 90B Vision Instruct',
						value: 'meta/llama-3.2-90b-vision-instruct',
						description: 'Multimodal: text + image understanding',
					},
					{
						name: 'Mistral 7B Instruct v0.3',
						value: 'mistralai/mistral-7b-instruct-v0.3',
						description: 'Fast, efficient general purpose',
					},
					{
						name: 'Mixtral 8x7B Instruct',
						value: 'mistralai/mixtral-8x7b-instruct-v0.1',
						description: 'Excellent for coding and technical tasks',
					},
					{
						name: 'Nemotron 4 340B Instruct',
						value: 'nvidia/nemotron-4-340b-instruct',
						description: 'NVIDIA\'s most advanced model',
					},
					{
						name: 'Phi-3 Mini 128K Instruct',
						value: 'microsoft/phi-3-mini-128k-instruct',
						description: 'Compact with long context (128K tokens)',
					},
					{
						name: 'Phi-3 Vision 128K Instruct',
						value: 'microsoft/phi-3-vision-128k-instruct',
						description: 'Vision + text with long context',
					},
				],
				default: 'meta/llama-3.1-8b-instruct',
				required: true,
				description: 'Select the NVIDIA NIM model to use for chat completions',
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
										description: 'AI assistant previous responses (for conversation history)',
									},
									{
										name: 'Tool',
										value: 'tool',
										description: 'Tool execution results to send back to the model',
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
								description: 'The message content. For tool role, this is the function execution result.',
								placeholder: 'Enter your message here',
							},
							{
								displayName: 'Tool Call ID',
								name: 'tool_call_id',
								type: 'string',
								displayOptions: {
									show: {
										role: ['tool'],
									},
								},
								default: '',
								required: true,
								description: 'The ID of the tool call this is responding to (from tool_calls in assistant message)',
								placeholder: 'call_abc123',
							},
							{
								displayName: 'Tool Call Name',
								name: 'name',
								type: 'string',
								displayOptions: {
									show: {
										role: ['tool'],
									},
								},
								default: '',
								description: 'The name of the tool that was called',
								placeholder: 'get_weather',
							},
						],
					},
				],
			},
			{
				displayName: 'Tools',
				name: 'tools',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				description: 'Functions that the model can call. Enables function calling/tool use capabilities.',
				options: [
					{
						name: 'toolValues',
						displayName: 'Tool',
						values: [
							{
								displayName: 'Function Name',
								name: 'name',
								type: 'string',
								default: '',
								required: true,
								description: 'The name of the function to call (e.g., get_weather)',
								placeholder: 'get_current_weather',
							},
							{
								displayName: 'Function Description',
								name: 'description',
								type: 'string',
								typeOptions: {
									rows: 2,
								},
								default: '',
								required: true,
								description: 'A description of what the function does',
								placeholder: 'Get the current weather in a given location',
							},
							{
								displayName: 'Parameters (JSON Schema)',
								name: 'parameters',
								type: 'json',
								default: '{\n  "type": "object",\n  "properties": {\n    "location": {\n      "type": "string",\n      "description": "City and state, e.g. San Francisco, CA"\n    }\n  },\n  "required": ["location"]\n}',
								description: 'JSON Schema describing the function parameters',
								typeOptions: {
									rows: 10,
								},
							},
						],
					},
				],
			},
			{
				displayName: 'Tool Choice',
				name: 'tool_choice',
				type: 'options',
				options: [
					{
						name: 'Auto',
						value: 'auto',
						description: 'Model decides whether to call functions',
					},
					{
						name: 'None',
						value: 'none',
						description: 'Model will not call any functions',
					},
					{
						name: 'Required',
						value: 'required',
						description: 'Model must call one or more functions',
					},
				],
				default: 'auto',
				description: 'Controls how the model responds to function calls',
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
};	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		// Process each input item
		for (let i = 0; i < items.length; i++) {
			try {
				const model = this.getNodeParameter('model', i) as string;
				const messagesData = this.getNodeParameter('messages', i) as any;
				const toolsData = this.getNodeParameter('tools', i, {}) as any;
				const toolChoice = this.getNodeParameter('tool_choice', i, 'auto') as string;
				const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as any;

				// Build messages array with proper structure for tool messages
				const messages = messagesData.messageValues?.map((msg: any) => {
					const message: any = {
						role: msg.role,
						content: msg.content,
					};
					
					// Add tool-specific fields for tool role messages
					if (msg.role === 'tool') {
						if (msg.tool_call_id) {
							message.tool_call_id = msg.tool_call_id;
						}
						if (msg.name) {
							message.name = msg.name;
						}
					}
					
					return message;
				}) || [];

				// Prepare request body
				const body: any = {
					model,
					messages,
				};

				// Add tools if provided
				if (toolsData.toolValues && toolsData.toolValues.length > 0) {
					body.tools = toolsData.toolValues.map((tool: any) => {
						let parameters;
						try {
							parameters = typeof tool.parameters === 'string' 
								? JSON.parse(tool.parameters) 
								: tool.parameters;
						} catch (error) {
							throw new NodeOperationError(
								this.getNode(),
								`Invalid JSON in parameters for tool "${tool.name}": ${(error as Error).message}`,
								{ itemIndex: i },
							);
						}
						
						return {
							type: 'function',
							function: {
								name: tool.name,
								description: tool.description,
								parameters,
							},
						};
					});
					
					// Add tool_choice if tools are provided
					body.tool_choice = toolChoice;
				}

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
