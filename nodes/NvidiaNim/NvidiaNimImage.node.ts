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

interface AdditionalOptions {
	max_tokens?: number;
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
		'nvidia': 'NVIDIA',
		'neva': 'NeVA',
		'fuyu': 'Fuyu',
		'kosmos': 'Kosmos',
		'vila': 'VILA',
		'microsoft': 'Microsoft',
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
	] as const;
	
	for (const { source, target } of mappings) {
		if (additionalOptions[source] !== undefined) {
			mappedOptions[target] = additionalOptions[source];
		}
	}
	
	return mappedOptions;
}

// Validate and process image input
function processImageInput(imageData: string): { isValid: boolean; imageUrl: string; error?: string } {
	if (!imageData || imageData.trim() === '') {
		return { isValid: false, imageUrl: '', error: 'Image data is required.' };
	}
	
	// Check if it's already a data URL
	if (imageData.startsWith('data:image/')) {
		if (!imageData.includes('base64,')) {
			return { isValid: false, imageUrl: '', error: 'Invalid data URL format.' };
		}
		return { isValid: true, imageUrl: imageData };
	}
	
	// Check if it's a direct URL
	if (imageData.startsWith('http://') || imageData.startsWith('https://')) {
		const urlPattern = /^https?:\/\/.+\.(jpe?g|png|JPE?G|PNG)(\?.*)?$/;
		if (!urlPattern.test(imageData)) {
			// Allow URLs without extensions as NVIDIA NIM can handle them
			return { isValid: true, imageUrl: imageData };
		}
		return { isValid: true, imageUrl: imageData };
	}
	
	// Assume it's base64 encoded image data without data URL prefix
	if (imageData.length < 100) {
		return { isValid: false, imageUrl: '', error: 'Image data appears too short to be valid.' };
	}
	
	// Add the data URL prefix assuming JPEG format
	return { isValid: true, imageUrl: `data:image/jpeg;base64,${imageData}` };
}

export class NvidiaNimImage implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'NVIDIA NIM Image Analysis',
		name: 'nvidiaNimImage',
		icon: 'file:nvidia-nim.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["model"]}}',
		description: 'Analyze images with NVIDIA NIM Vision Language Models',
		defaults: {
			name: 'NVIDIA NIM Image Analysis',
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
				default: { mode: 'list', value: 'meta/llama-3.2-11b-vision-instruct' },
				required: true,
				description: 'Select the NVIDIA NIM Vision Language Model to use for image analysis',
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
						placeholder: 'e.g., meta/llama-3.2-11b-vision-instruct',
					},
				],
			},
			{
				displayName: 'Image Data',
				name: 'imageData',
				type: 'string',
				default: '',
				description: 'Base64 encoded image data, data URL, or image URL (JPG, JPEG, PNG supported)',
				placeholder: 'https://example.com/image.jpg or data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/...',
				typeOptions: {
					rows: 4,
				},
			},
			{
				displayName: 'Prompt',
				name: 'prompt',
				type: 'string',
				default: 'Describe this image in detail.',
				description: 'The prompt to use for image analysis',
				placeholder: 'What is in this image?',
				typeOptions: {
					rows: 3,
				},
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
					
					// Filter for vision/language models and format for n8n
					// Only include Llama models for image analysis
					const results = models
						.filter((model: NvidiaModel) => {
							// Include only Llama models that support vision tasks
							const modelId = model.id || model.model || '';
							// Convert to lowercase for case-insensitive matching
							const lowerModelId = modelId.toLowerCase();
							return modelId && (
								lowerModelId.includes('llama') && lowerModelId.includes('vision')
							);
						})
						.map((model: NvidiaModel) => {
							const modelId = model.id || model.model || '';
							
							// Format model name
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
					// Fallback to default vision models if API fails
					// Only include Llama models
					return {
						results: [
							{ name: 'Llama 3.2 11B Vision', value: 'meta/llama-3.2-11b-vision-instruct' },
							{ name: 'Llama 3.2 90B Vision', value: 'meta/llama-3.2-90b-vision-instruct' },
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
				const imageData = this.getNodeParameter('imageData', i) as string;
				const prompt = this.getNodeParameter('prompt', i) as string;
				const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as AdditionalOptions;

				// Process and validate image input
				const imageProcessing = processImageInput(imageData);
				if (!imageProcessing.isValid) {
					throw new NodeOperationError(
						this.getNode(),
						imageProcessing.error!,
						{ itemIndex: i },
					);
				}

				// Prepare messages array with image using OpenAI-compatible format
				const messages = [
					{
						role: "user",
						content: [
							{ type: "text", text: prompt },
							{ 
								type: "image_url", 
								image_url: { 
									url: imageProcessing.imageUrl
								} 
							}
						]
					}
				];

				// Prepare request body
				const body: any = { 
					model, 
					messages,
					stream: false
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
					`Failed to process image analysis: ${errorMessage}`,
					{ itemIndex: i },
				);
			}
		}

		return [returnData];
	}
}