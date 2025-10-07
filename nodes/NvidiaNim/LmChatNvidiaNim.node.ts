import { ChatOpenAI, type ClientOptions } from '@langchain/openai';
import {
	NodeConnectionTypes,
	type ILoadOptionsFunctions,
	type INodeListSearchResult,
	type INodeType,
	type INodeTypeDescription,
	type ISupplyDataFunctions,
	type SupplyData,
} from 'n8n-workflow';

export class LmChatNvidiaNim implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'NVIDIA NIM Chat Model',
		name: 'lmChatNvidiaNim',
		icon: 'file:nvidia-nim.svg',
		group: ['transform'],
		version: 1,
		description: 'Language model sub-node for AI Agents and Chains',
		defaults: {
			name: 'NVIDIA NIM Chat Model',
		},
		codex: {
			categories: ['AI'],
			subcategories: {
				AI: ['Language Models', 'Root Nodes'],
				'Language Models': ['Chat Models (Recommended)'],
			},
			resources: {
				primaryDocumentation: [
					{
						url: 'https://docs.nvidia.com/nim/',
					},
				],
			},
		},
		// eslint-disable-next-line n8n-nodes-base/node-class-description-inputs-wrong-regular-node
		inputs: [],
		// eslint-disable-next-line n8n-nodes-base/node-class-description-outputs-wrong
		outputs: [NodeConnectionTypes.AiLanguageModel],
		outputNames: ['Model'],
		credentials: [
			{
				name: 'nvidiaNimApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Notice',
				name: 'notice',
				type: 'notice',
				default: '',
				description: 'Connect this Chat Model to an AI Agent or AI Chain to enable NVIDIA NIM inference',
			},
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
				displayName: 'Options',
				name: 'options',
				placeholder: 'Add Option',
				description: 'Additional options for the model',
				type: 'collection',
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
						description: 'Penalizes tokens based on their frequency in the text so far. Range: -2.0 to 2.0.',
					},
					{
						displayName: 'Max Tokens',
						name: 'maxTokens',
						type: 'number',
						typeOptions: {
							minValue: 1,
							maxValue: 32768,
						},
						default: 1024,
						description: 'Maximum number of tokens to generate in the completion',
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
						description: 'Penalizes tokens that have already appeared in the text. Range: -2.0 to 2.0.',
					},
					{
						displayName: 'Sampling Temperature',
						name: 'temperature',
						type: 'number',
						typeOptions: {
							minValue: 0,
							maxValue: 2,
							numberPrecision: 2,
						},
						default: 0.7,
						description: 'Controls randomness in the output. Lower values make output more focused and deterministic. Range: 0.0 to 2.0.',
					},
					{
						displayName: 'Timeout',
						name: 'timeout',
						type: 'number',
						typeOptions: {
							minValue: 1,
						},
						default: 60000,
						description: 'Maximum time (in milliseconds) to wait for a response',
					},
					{
						displayName: 'Top P',
						name: 'topP',
						type: 'number',
						typeOptions: {
							minValue: 0,
							maxValue: 1,
							numberPrecision: 2,
						},
						default: 1,
						description: 'Nucleus sampling: only tokens with cumulative probability up to this value are considered. Range: 0.0 to 1.0.',
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

	async supplyData(this: ISupplyDataFunctions, itemIndex: number): Promise<SupplyData> {
		const credentials = await this.getCredentials('nvidiaNimApi');
		// Handle resourceLocator format for model parameter
		const modelResource = this.getNodeParameter('model', itemIndex) as { mode: string; value: string };
		const model = modelResource.value || modelResource as any as string;
		const options = this.getNodeParameter('options', itemIndex, {}) as Record<string, any>;

		// Get base URL from credentials
		const baseURL = credentials.baseUrl as string;

		// Configure ChatOpenAI to use NVIDIA NIM endpoint
		const config: ClientOptions = {
			apiKey: credentials.apiKey as string,
			baseURL,
			timeout: options.timeout ?? 60000,
			maxRetries: 2,
		};

		const chatModel = new ChatOpenAI({
			model,
			temperature: options.temperature ?? 0.7,
			maxTokens: options.maxTokens ?? 1024,
			topP: options.topP ?? 1,
			frequencyPenalty: options.frequency_penalty ?? 0,
			presencePenalty: options.presence_penalty ?? 0,
			configuration: config,
		});

		return {
			response: chatModel,
		};
	}
}
