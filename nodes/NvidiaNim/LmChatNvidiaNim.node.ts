import { ChatOpenAI, type ClientOptions } from '@langchain/openai';
import {
	NodeConnectionTypes,
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
				type: 'string',
				default: 'meta/llama3-8b-instruct',
				required: true,
				description: 'The NVIDIA NIM model to use. Examples: meta/llama3-8b-instruct, meta/llama3-70b-instruct, mistralai/mixtral-8x7b-instruct-v0.1.',
				placeholder: 'meta/llama3-8b-instruct',
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

	async supplyData(this: ISupplyDataFunctions, itemIndex: number): Promise<SupplyData> {
		const credentials = await this.getCredentials('nvidiaNimApi');
		const model = this.getNodeParameter('model', itemIndex) as string;
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
