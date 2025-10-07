import { AgentExecutor, createToolCallingAgent } from 'langchain/agents';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import type { BaseChatMemory } from 'langchain/memory';
import type { BaseChatModel } from '@langchain/core/language_models/chat_models';
import type { Tool, DynamicStructuredTool } from '@langchain/core/tools';
import {
	NodeConnectionTypes,
	NodeOperationError,
	type IExecuteFunctions,
	type INodeExecutionData,
	type INodeType,
	type INodeTypeDescription,
} from 'n8n-workflow';

/**
 * NVIDIA NIM AI Agent Node
 * 
 * This node implements a complete AI Agent following n8n best practices:
 * - Connects to Chat Model via ai_languageModel
 * - Connects to Memory via ai_memory
 * - Connects to Tools via ai_tool
 * - Uses n8n's helper functions for proper integration
 */
export class NvidiaNimAgent implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'NVIDIA NIM AI Agent',
		name: 'nvidiaNimAgent',
		icon: 'file:nvidia-nim.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["options"]["systemMessage"] || "AI Agent"}}',
		description: 'AI Agent with NVIDIA NIM support - connects to Chat Model, Memory, and Tools',
		defaults: {
			name: 'NVIDIA NIM AI Agent',
		},
		codex: {
			categories: ['AI'],
			subcategories: {
				AI: ['Agents', 'Root Nodes'],
			},
			resources: {
				primaryDocumentation: [
					{
						url: 'https://docs.nvidia.com/nim/',
					},
				],
			},
		},
		// Input configuration following n8n patterns
		// eslint-disable-next-line n8n-nodes-base/node-class-description-inputs-wrong-regular-node
		inputs: [
			NodeConnectionTypes.Main,
			{
				type: NodeConnectionTypes.AiLanguageModel,
				displayName: 'Model',
				required: true,
				maxConnections: 1,
			},
			{
				type: NodeConnectionTypes.AiMemory,
				displayName: 'Memory',
				maxConnections: 1,
			},
			{
				type: NodeConnectionTypes.AiTool,
				displayName: 'Tool',
			},
		],
		// eslint-disable-next-line n8n-nodes-base/node-class-description-outputs-wrong
		outputs: [NodeConnectionTypes.Main],
		properties: [
			// Connection hints for users
			{
				displayName: 'Connect a Chat Model (e.g., NVIDIA NIM Chat Model) to provide AI capabilities',
				name: 'noticeModel',
				type: 'notice',
				default: '',
			},
			// Main input text
			{
				displayName: 'Text',
				name: 'text',
				type: 'string',
				default: '={{ $json.chatInput }}',
				required: true,
				typeOptions: {
					rows: 4,
				},
				description: 'The input text/prompt for the AI agent. Use expressions to get from previous nodes.',
				placeholder: 'What would you like help with?',
			},
			// Additional options
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'System Message',
						name: 'systemMessage',
						type: 'string',
						default: 'You are a helpful AI assistant powered by NVIDIA NIM. Use available tools when needed to provide accurate answers.',
						typeOptions: {
							rows: 3,
						},
						description: 'System instructions to guide the AI\'s behavior',
						placeholder: 'You are a helpful assistant...',
					},
					{
						displayName: 'Max Iterations',
						name: 'maxIterations',
						type: 'number',
						default: 10,
						typeOptions: {
							minValue: 1,
							maxValue: 50,
						},
						description: 'Maximum number of tool calls the agent can make before stopping',
					},
					{
						displayName: 'Return Intermediate Steps',
						name: 'returnIntermediateSteps',
						type: 'boolean',
						default: false,
						description: 'Whether to include intermediate steps (tool calls) in the output',
					},
					{
						displayName: 'Verbose',
						name: 'verbose',
						type: 'boolean',
						default: false,
						description: 'Whether to log detailed information during execution',
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		// Get Chat Model (required)
		let model: BaseChatModel;
		try {
			model = (await this.getInputConnectionData(
				NodeConnectionTypes.AiLanguageModel,
				0,
			)) as BaseChatModel;

			if (!model) {
				throw new NodeOperationError(
					this.getNode(),
					'No Chat Model connected. Please connect a Chat Model node (e.g., NVIDIA NIM Chat Model) to the Model input.',
					{ itemIndex: 0 },
				);
			}

			// Validate it's a chat model
			if (!model.invoke || typeof model.invoke !== 'function') {
				throw new NodeOperationError(
					this.getNode(),
					'Connected node is not a valid Chat Model. Please use a Chat Model node.',
					{ itemIndex: 0 },
				);
			}
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			throw new NodeOperationError(
				this.getNode(),
				'Failed to get Chat Model. Make sure a Chat Model node is connected to the Model input.',
				{
					description: errorMessage,
					itemIndex: 0,
				},
			);
		}

		// Get Memory (optional)
		let memory: BaseChatMemory | undefined;
		try {
			memory = (await this.getInputConnectionData(
				NodeConnectionTypes.AiMemory,
				0,
			).catch(() => undefined)) as BaseChatMemory | undefined;
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			this.logger.warn('Failed to get memory, continuing without it', { error: errorMessage });
		}

		// Get Tools (optional) - using proper helper to handle multiple connections
		let tools: Array<Tool | DynamicStructuredTool> = [];
		try {
			const connectedTools = await this.getInputConnectionData(
				NodeConnectionTypes.AiTool,
				0,
			).catch(() => []);

			if (Array.isArray(connectedTools)) {
				tools = connectedTools as Array<Tool | DynamicStructuredTool>;
			}
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			this.logger.warn('Failed to get tools, continuing without them', { error: errorMessage });
		}

		// Process each input item
		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				// Get parameters for this item
				const text = this.getNodeParameter('text', itemIndex) as string;
				const options = this.getNodeParameter('options', itemIndex, {}) as {
					systemMessage?: string;
					maxIterations?: number;
					returnIntermediateSteps?: boolean;
					verbose?: boolean;
				};

				// Validate input
				if (!text || typeof text !== 'string' || text.trim().length === 0) {
					throw new NodeOperationError(
						this.getNode(),
						'Text parameter is required and must be a non-empty string',
						{ itemIndex },
					);
				}

				// Create prompt template following n8n Agent patterns
				const systemMessage = options.systemMessage || 
					'You are a helpful AI assistant powered by NVIDIA NIM. Use available tools when needed to provide accurate answers.';

				const prompt = ChatPromptTemplate.fromMessages([
					['system', systemMessage],
					['placeholder', '{chat_history}'],
					['human', '{input}'],
					['placeholder', '{agent_scratchpad}'],
				]);

				// Create tool-calling agent
				const agent = await createToolCallingAgent({
					llm: model,
					tools,
					prompt,
				});

				// Create agent executor with options
				const executor = AgentExecutor.fromAgentAndTools({
					agent,
					tools,
					memory,
					maxIterations: options.maxIterations ?? 10,
					returnIntermediateSteps: options.returnIntermediateSteps ?? false,
					verbose: options.verbose ?? false,
					handleParsingErrors: true,
				});

				// Log execution details if verbose
				if (options.verbose) {
					this.logger.info('Executing NVIDIA NIM Agent', {
						modelConnected: !!model,
						memoryConnected: !!memory,
						toolsConnected: tools.length,
						maxIterations: options.maxIterations ?? 10,
					});
				}

				// Execute the agent
				const startTime = Date.now();
				const response = await executor.invoke({
					input: text,
				});
				const executionTime = Date.now() - startTime;

				// Prepare output data
				const outputData: any = {
					output: response.output,
					executionTime,
				};

				// Include intermediate steps if requested
				if (options.returnIntermediateSteps && response.intermediateSteps) {
					outputData.intermediateSteps = response.intermediateSteps.map((step: any) => ({
						action: step.action?.tool || 'unknown',
						input: step.action?.toolInput,
						output: step.observation,
					}));
				}

				// Include metadata
				outputData.metadata = {
					modelUsed: model.constructor.name,
					memoryUsed: !!memory,
					toolsAvailable: tools.map(t => t.name),
					iterations: response.intermediateSteps?.length || 0,
				};

				// Add to return data
				returnData.push({
					json: outputData,
					pairedItem: { item: itemIndex },
				});

				if (options.verbose) {
					this.logger.info('Agent execution completed', {
						executionTime,
						iterations: response.intermediateSteps?.length || 0,
					});
				}

			} catch (error) {
				// Handle errors gracefully
				if (this.continueOnFail()) {
					const errorObj = error instanceof Error ? error : new Error(String(error));
					this.logger.error('Agent execution failed', { error: errorObj.message });
					
					returnData.push({
						json: {
							error: errorObj.message,
							errorType: errorObj.constructor.name,
							item: itemIndex,
						},
						pairedItem: { item: itemIndex },
					});
					continue;
				}

				// Enhance error message
				const errorObj = error instanceof Error ? error : new Error(String(error));
				throw new NodeOperationError(
					this.getNode(),
					`Agent execution failed: ${errorObj.message}`,
					{
						itemIndex,
						description: errorObj.stack,
					},
				);
			}
		}

		return [returnData];
	}
}
