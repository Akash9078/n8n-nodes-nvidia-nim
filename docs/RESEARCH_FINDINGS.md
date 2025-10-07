# N8N AI Agent Node Development - Deep Research Findings

## Executive Summary

This document contains comprehensive research findings on creating custom AI agent nodes for n8n, including architecture patterns, tool integration, memory management, and best practices based on analysis of n8n's official codebase and LangChain integration.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Node Connection Types](#2-node-connection-types)
3. [Sub-Node Pattern (supplyData)](#3-sub-node-pattern-supplydata)
4. [Tool Integration](#4-tool-integration)
5. [Memory Integration](#5-memory-integration)
6. [Best Practices](#6-best-practices)
7. [Implementation Patterns](#7-implementation-patterns)
8. [Common Pitfalls](#8-common-pitfalls)

---

## 1. Architecture Overview

### 1.1 N8N AI Node Ecosystem

N8N uses a **visual sub-node architecture** for AI components:

```
┌──────────────────────────────────────────────────────┐
│              AI Agent (Main Node)                    │
│  - Orchestrates execution                            │
│  - Manages conversation flow                         │
│  - Coordinates tools and memory                      │
└──────────────────────────────────────────────────────┘
    ▲           ▲            ▲
    │           │            │
    │ ai_languageModel      │ ai_tool    │ ai_memory
    │           │            │
┌───┴───┐  ┌───┴────┐  ┌───┴───┐
│ Chat  │  │  Tool  │  │Memory │
│ Model │  │  Node  │  │ Node  │
└───────┘  └────────┘  └───────┘
```

### 1.2 Key Design Principles

1. **Separation of Concerns**: Chat models, tools, and memory are separate sub-nodes
2. **Type Safety**: Connection types ensure only compatible nodes can connect
3. **Reusability**: Sub-nodes can be reused across multiple agents
4. **Visual Clarity**: Users see data flow in the canvas

---

## 2. Node Connection Types

### 2.1 AI-Specific Connection Types

```typescript
enum NodeConnectionTypes {
  // Standard data flow
  Main = 'main',
  
  // AI-specific connections
  AiLanguageModel = 'ai_languageModel',    // Chat models
  AiTool = 'ai_tool',                      // Tools
  AiMemory = 'ai_memory',                  // Memory systems
  AiAgent = 'ai_agent',                    // Agents
  AiChain = 'ai_chain',                    // Chains
  AiEmbedding = 'ai_embedding',            // Embeddings
  AiVectorStore = 'ai_vectorStore',        // Vector databases
  AiDocument = 'ai_document',              // Document loaders
  AiTextSplitter = 'ai_textSplitter',      // Text splitters
  AiRetriever = 'ai_retriever',            // Retrievers
  AiOutputParser = 'ai_outputParser',      // Output parsers
}
```

### 2.2 Connection Direction Rules

**CRITICAL**: Connection direction determines which node is source vs target:

| Connection Type | Source (Produces) | Target (Consumes) |
|----------------|-------------------|-------------------|
| `main` | Any node | Any node |
| `ai_languageModel` | Chat Model | Agent/Chain |
| `ai_tool` | Tool Node | Agent |
| `ai_memory` | Memory Node | Agent/Chain |
| `ai_embedding` | Embedding Model | Vector Store |

**Example from n8n codebase**:
```typescript
// CORRECT: Chat Model → Agent
connections: {
  'OpenAI Chat Model': {
    ai_languageModel: [[{
      node: 'AI Agent',
      type: 'ai_languageModel',
      index: 0
    }]]
  }
}

// INCORRECT: Agent → Chat Model (backwards!)
```

---

## 3. Sub-Node Pattern (supplyData)

### 3.1 The `supplyData` Function

Chat models and other AI sub-nodes use `supplyData` instead of `execute`:

```typescript
export class LmChatNvidiaNim implements INodeType {
  description: INodeTypeDescription = {
    // ... properties
    inputs: [],  // NO inputs for sub-nodes!
    outputs: [NodeConnectionTypes.AiLanguageModel],
    outputNames: ['Model'],
  };

  async supplyData(
    this: ISupplyDataFunctions,
    itemIndex: number
  ): Promise<SupplyData> {
    // Get credentials
    const credentials = await this.getCredentials('nvidiaNimApi');
    
    // Get parameters
    const model = this.getNodeParameter('model', itemIndex) as string;
    const options = this.getNodeParameter('options', itemIndex, {}) as object;

    // Create LangChain model instance
    const chatModel = new ChatOpenAI({
      model,
      apiKey: credentials.apiKey as string,
      baseURL: credentials.baseUrl as string,
      // ... other options
      callbacks: [new N8nLlmTracing(this)],
      onFailedAttempt: makeN8nLlmFailedAttemptHandler(this),
    });

    // Return the model instance
    return {
      response: chatModel,
    };
  }
}
```

### 3.2 Why `supplyData` vs `execute`?

| Aspect | `execute` | `supplyData` |
|--------|-----------|--------------|
| **Purpose** | Run node logic | Provide instances to other nodes |
| **Returns** | `INodeExecutionData[][]` | `SupplyData` |
| **When called** | During workflow execution | When connected node needs it |
| **Use case** | Regular nodes | AI sub-nodes (models, tools, memory) |

### 3.3 Key Interfaces

```typescript
interface ISupplyDataFunctions {
  getNodeParameter(
    parameterName: string,
    itemIndex: number,
    fallbackValue?: any
  ): NodeParameterValueType;
  
  getCredentials(type: string): Promise<ICredentialDataDecryptedObject>;
  
  getInputConnectionData(
    connectionType: NodeConnectionType,
    itemIndex: number
  ): Promise<unknown>;
  
  helpers: {
    // Request helpers
    requestWithAuthentication(
      credentialsType: string,
      options: object
    ): Promise<any>;
    
    // ... other helpers
  };
  
  logger: ILogger;
  getNode(): INode;
}

interface SupplyData {
  response: unknown;  // LangChain instance (ChatModel, Tool, Memory, etc.)
  closeFunction?: () => Promise<void>;  // Optional cleanup
}
```

---

## 4. Tool Integration

### 4.1 Tool Connection Architecture

Tools in n8n connect to agents via the `ai_tool` connection type. The n8n framework automatically:

1. **Retrieves connected tools** via `getInputConnectionData(NodeConnectionTypes.AiTool, 0)`
2. **Converts them to LangChain tools** if they don't have `supplyData`
3. **Passes them to the agent** for execution

### 4.2 Two Types of Tool Nodes

#### A. Native Tool Sub-Nodes (with `supplyData`)

```typescript
export class ToolCalculator implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Calculator',
    name: 'toolCalculator',
    group: ['transform'],
    version: 1,
    description: 'Perform mathematical calculations',
    inputs: [],  // No inputs!
    outputs: [NodeConnectionTypes.AiTool],
    outputNames: ['Tool'],
    properties: [/* ... */],
  };

  async supplyData(this: ISupplyDataFunctions): Promise<SupplyData> {
    const calculator = new Calculator();
    return {
      response: logWrapper(calculator, this),
    };
  }
}
```

#### B. Regular Nodes Wrapped as Tools

Any n8n node can become a tool if marked with `usableAsTool`:

```typescript
export class HttpRequest implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'HTTP Request',
    name: 'httpRequest',
    // ... other properties
    usableAsTool: true,  // Makes it available as a tool!
  };
}
```

N8N automatically wraps such nodes using the `N8nTool` class.

### 4.3 Getting Connected Tools in Agent

```typescript
// In your agent's execute function
import { getConnectedTools } from '@utils/helpers';

async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
  // Get all connected tools
  const tools = await getConnectedTools(
    this,
    true,   // enforceUniqueNames: prevents duplicate tool names
    false,  // convertStructuredTool: keep as-is
    true    // escapeCurlyBrackets: escape LangChain template syntax
  );

  // Tools is now Array<Tool | DynamicStructuredTool>
  // Pass to your agent...
}
```

### 4.4 Tool Schema and Validation

Tools can define schemas using Zod for structured input:

```typescript
import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';

const weatherTool = new DynamicStructuredTool({
  name: 'get_weather',
  description: 'Get current weather for a location',
  schema: z.object({
    location: z.string().describe('City name'),
    unit: z.enum(['celsius', 'fahrenheit']).optional(),
  }),
  func: async ({ location, unit }) => {
    // Tool implementation
    return `Weather in ${location}: 72°${unit === 'celsius' ? 'C' : 'F'}`;
  },
});
```

### 4.5 Tool Calling Pattern (From n8n Agent)

```typescript
// From n8n's Tools Agent implementation
import { createToolCallingAgent, AgentExecutor } from 'langchain/agents';

// Get model, memory, tools
const model = await getChatModel(this, 0);
const memory = await getOptionalMemory(this);
const tools = await getTools(this, outputParser);

// Create agent
const agent = await createToolCallingAgent({
  llm: model,
  tools,
  prompt: chatPrompt,
});

// Create executor
const executor = AgentExecutor.fromAgentAndTools({
  agent,
  tools,
  memory,
  maxIterations: options.maxIterations ?? 10,
  returnIntermediateSteps: true,
});

// Execute
const result = await executor.invoke({
  input: userMessage,
});
```

---

## 5. Memory Integration

### 5.1 Memory Connection Pattern

Memory nodes connect via `ai_memory` connection type:

```typescript
export class MemoryBufferWindow implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Window Buffer Memory',
    name: 'memoryBufferWindow',
    inputs: [],
    outputs: [NodeConnectionTypes.AiMemory],
    outputNames: ['Memory'],
    properties: [
      {
        displayName: 'Session ID',
        name: 'sessionKey',
        type: 'string',
        default: '={{ $json.sessionId }}',
        description: 'Key to identify the conversation session',
      },
      {
        displayName: 'Context Window Size',
        name: 'contextWindowLength',
        type: 'number',
        default: 10,
        description: 'Number of messages to keep in memory',
      },
    ],
  };

  async supplyData(this: ISupplyDataFunctions, itemIndex: number): Promise<SupplyData> {
    const sessionKey = getSessionId(this, itemIndex);
    const contextWindowLength = this.getNodeParameter('contextWindowLength', itemIndex) as number;

    const memory = new BufferWindowMemory({
      k: contextWindowLength,
      sessionId: sessionKey,
      returnMessages: true,
      inputKey: 'input',
      outputKey: 'output',
      memoryKey: 'chat_history',
    });

    return {
      response: logWrapper(memory, this),
    };
  }
}
```

### 5.2 Getting Memory in Agent

```typescript
// From n8n's Tools Agent common.ts
export async function getOptionalMemory(
  ctx: IExecuteFunctions | ISupplyDataFunctions
): Promise<BaseChatMemory | undefined> {
  return (await ctx.getInputConnectionData(
    NodeConnectionTypes.AiMemory,
    0
  )) as BaseChatMemory | undefined;
}

// Usage in agent
const memory = await getOptionalMemory(this);
if (memory) {
  // Memory is connected, use it
}
```

### 5.3 Memory Types in LangChain

Common memory types used in n8n:

```typescript
// Buffer Memory - stores all messages
import { BufferMemory } from 'langchain/memory';

// Buffer Window Memory - stores last N messages
import { BufferWindowMemory } from 'langchain/memory';

// Summary Memory - summarizes old messages
import { ConversationSummaryMemory } from 'langchain/memory';

// External Memory (Postgres, Redis, etc.)
import { PostgresChatMessageHistory } from '@langchain/community/stores/message/postgres';
```

### 5.4 Session Management

Memory nodes should support session IDs for multi-user scenarios:

```typescript
// Common pattern from n8n
export function getSessionId(
  ctx: ISupplyDataFunctions | IExecuteFunctions,
  itemIndex: number
): string {
  const sessionIdType = ctx.getNodeParameter('sessionIdType', itemIndex, 'fromInput') as string;
  
  if (sessionIdType === 'fromInput') {
    const sessionKey = ctx.getNodeParameter('sessionKey', itemIndex) as string;
    return this.evaluateExpression(sessionKey, itemIndex) as string;
  } else {
    return ctx.getNodeParameter('sessionId', itemIndex, 'default') as string;
  }
}
```

---

## 6. Best Practices

### 6.1 Error Handling

```typescript
// Use n8n's tracing and error handling
import { N8nLlmTracing } from '../N8nLlmTracing';
import { makeN8nLlmFailedAttemptHandler } from '../n8nLlmFailedAttemptHandler';

const model = new ChatOpenAI({
  // ... config
  callbacks: [new N8nLlmTracing(this)],
  onFailedAttempt: makeN8nLlmFailedAttemptHandler(this),
});
```

### 6.2 Logging

```typescript
import { logWrapper } from '@utils/logWrapper';

// Wrap tools and memory for automatic logging
const tool = logWrapper(toolInstance, this);
const memory = logWrapper(memoryInstance, this);
```

### 6.3 Connection Hints

```typescript
import { getConnectionHintNoticeField } from '@utils/sharedFields';

properties: [
  getConnectionHintNoticeField([
    NodeConnectionTypes.AiChain,
    NodeConnectionTypes.AiAgent,
  ]),
  // ... other properties
]
```

### 6.4 Parameter Validation

```typescript
// Use type guards
if (typeof model !== 'string' || !model) {
  throw new NodeOperationError(
    this.getNode(),
    'Model parameter is required',
    { itemIndex }
  );
}

// Validate ranges
if (temperature < 0 || temperature > 2) {
  throw new NodeOperationError(
    this.getNode(),
    'Temperature must be between 0 and 2',
    { itemIndex }
  );
}
```

### 6.5 Resource Cleanup

```typescript
async supplyData(this: ISupplyDataFunctions): Promise<SupplyData> {
  const client = await connectToService();

  return {
    response: model,
    closeFunction: async () => {
      await client.disconnect();
    },
  };
}
```

---

## 7. Implementation Patterns

### 7.1 Complete Chat Model Pattern

```typescript
import { ChatOpenAI, type ClientOptions } from '@langchain/openai';
import {
  NodeConnectionTypes,
  type INodeType,
  type INodeTypeDescription,
  type ISupplyDataFunctions,
  type SupplyData,
} from 'n8n-workflow';
import { getConnectionHintNoticeField } from '@utils/sharedFields';
import { N8nLlmTracing } from '../N8nLlmTracing';
import { makeN8nLlmFailedAttemptHandler } from '../n8nLlmFailedAttemptHandler';

export class LmChatCustom implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Custom Chat Model',
    name: 'lmChatCustom',
    icon: 'file:custom.svg',
    group: ['transform'],
    version: 1,
    description: 'Chat Model for AI Agents',
    defaults: {
      name: 'Custom Chat Model',
    },
    codex: {
      categories: ['AI'],
      subcategories: {
        AI: ['Language Models', 'Root Nodes'],
        'Language Models': ['Chat Models (Recommended)'],
      },
    },
    inputs: [],
    outputs: [NodeConnectionTypes.AiLanguageModel],
    outputNames: ['Model'],
    credentials: [
      {
        name: 'customApi',
        required: true,
      },
    ],
    properties: [
      getConnectionHintNoticeField([
        NodeConnectionTypes.AiChain,
        NodeConnectionTypes.AiAgent,
      ]),
      {
        displayName: 'Model',
        name: 'model',
        type: 'string',
        default: 'custom-model',
        required: true,
        description: 'The model to use',
      },
      {
        displayName: 'Options',
        name: 'options',
        type: 'collection',
        placeholder: 'Add Option',
        default: {},
        options: [
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
            description: 'Controls randomness (0-2)',
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
            description: 'Maximum tokens to generate',
          },
        ],
      },
    ],
  };

  async supplyData(this: ISupplyDataFunctions, itemIndex: number): Promise<SupplyData> {
    const credentials = await this.getCredentials('customApi');
    const model = this.getNodeParameter('model', itemIndex) as string;
    const options = this.getNodeParameter('options', itemIndex, {}) as {
      temperature?: number;
      maxTokens?: number;
    };

    const configuration: ClientOptions = {
      apiKey: credentials.apiKey as string,
      baseURL: credentials.baseUrl as string,
    };

    const chatModel = new ChatOpenAI({
      model,
      temperature: options.temperature ?? 0.7,
      maxTokens: options.maxTokens ?? 1024,
      configuration,
      callbacks: [new N8nLlmTracing(this)],
      onFailedAttempt: makeN8nLlmFailedAttemptHandler(this),
    });

    return {
      response: chatModel,
    };
  }
}
```

### 7.2 Complete Agent Pattern

```typescript
import { AgentExecutor, createToolCallingAgent } from 'langchain/agents';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import type {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';
import { getConnectedTools } from '@utils/helpers';

export class CustomAgent implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Custom AI Agent',
    name: 'customAgent',
    group: ['transform'],
    version: 1,
    description: 'AI Agent with tool and memory support',
    defaults: {
      name: 'Custom AI Agent',
    },
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
    outputs: [NodeConnectionTypes.Main],
    properties: [
      {
        displayName: 'Prompt',
        name: 'text',
        type: 'string',
        default: '={{ $json.chatInput }}',
        typeOptions: {
          rows: 4,
        },
      },
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
            default: 'You are a helpful AI assistant.',
            typeOptions: {
              rows: 3,
            },
          },
          {
            displayName: 'Max Iterations',
            name: 'maxIterations',
            type: 'number',
            default: 10,
            description: 'Maximum number of tool calls',
          },
        ],
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    // Get model (required)
    const model = await this.getInputConnectionData(
      NodeConnectionTypes.AiLanguageModel,
      0
    );

    // Get memory (optional)
    const memory = await this.getInputConnectionData(
      NodeConnectionTypes.AiMemory,
      0
    ).catch(() => undefined);

    // Get tools (optional)
    const tools = await getConnectedTools(this, true, false, true);

    // Process each item
    for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
      try {
        const text = this.getNodeParameter('text', itemIndex) as string;
        const options = this.getNodeParameter('options', itemIndex, {}) as {
          systemMessage?: string;
          maxIterations?: number;
        };

        // Create prompt
        const prompt = ChatPromptTemplate.fromMessages([
          ['system', options.systemMessage ?? 'You are a helpful assistant.'],
          ['placeholder', '{chat_history}'],
          ['human', '{input}'],
          ['placeholder', '{agent_scratchpad}'],
        ]);

        // Create agent
        const agent = await createToolCallingAgent({
          llm: model,
          tools,
          prompt,
        });

        // Create executor
        const executor = AgentExecutor.fromAgentAndTools({
          agent,
          tools,
          memory,
          maxIterations: options.maxIterations ?? 10,
          returnIntermediateSteps: false,
        });

        // Execute
        const response = await executor.invoke({
          input: text,
        });

        returnData.push({
          json: {
            output: response.output,
          },
          pairedItem: { item: itemIndex },
        });
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: {
              error: error.message,
            },
            pairedItem: { item: itemIndex },
          });
          continue;
        }
        throw error;
      }
    }

    return [returnData];
  }
}
```

---

## 8. Common Pitfalls

### 8.1 Connection Direction Mistakes

❌ **WRONG**:
```typescript
// Agent as source, model as target (backwards!)
connections: {
  'AI Agent': {
    ai_languageModel: [[{ node: 'Chat Model' }]]
  }
}
```

✅ **CORRECT**:
```typescript
// Model as source, agent as target
connections: {
  'Chat Model': {
    ai_languageModel: [[{ node: 'AI Agent' }]]
  }
}
```

### 8.2 Using `execute` Instead of `supplyData`

❌ **WRONG** for sub-nodes:
```typescript
export class LmChatModel implements INodeType {
  async execute(this: IExecuteFunctions) {
    // This won't work for AI sub-nodes!
  }
}
```

✅ **CORRECT**:
```typescript
export class LmChatModel implements INodeType {
  async supplyData(this: ISupplyDataFunctions, itemIndex: number): Promise<SupplyData> {
    // Return LangChain instance
  }
}
```

### 8.3 Missing Inputs/Outputs Configuration

❌ **WRONG**:
```typescript
description: {
  // Missing outputs!
  inputs: [NodeConnectionTypes.Main],
}
```

✅ **CORRECT**:
```typescript
description: {
  inputs: [],  // Sub-nodes have NO inputs
  outputs: [NodeConnectionTypes.AiLanguageModel],
  outputNames: ['Model'],
}
```

### 8.4 Not Handling Optional Connections

❌ **WRONG**:
```typescript
// Assumes memory is always connected
const memory = await this.getInputConnectionData(NodeConnectionTypes.AiMemory, 0);
```

✅ **CORRECT**:
```typescript
// Handle optional memory
const memory = await this.getInputConnectionData(NodeConnectionTypes.AiMemory, 0)
  .catch(() => undefined);

if (memory) {
  // Memory is connected
}
```

### 8.5 Duplicate Tool Names

❌ **WRONG**:
```typescript
const tools = await this.getInputConnectionData(NodeConnectionTypes.AiTool, 0);
// Multiple tools might have same name!
```

✅ **CORRECT**:
```typescript
const tools = await getConnectedTools(
  this,
  true  // enforceUniqueNames: true
);
```

---

## 9. Testing Patterns

### 9.1 Unit Testing Sub-Nodes

```typescript
import { mock } from 'jest-mock-extended';
import type { ISupplyDataFunctions } from 'n8n-workflow';

describe('LmChatCustom', () => {
  it('should supply chat model instance', async () => {
    const mockContext = mock<ISupplyDataFunctions>();
    mockContext.getCredentials.mockResolvedValue({
      apiKey: 'test-key',
      baseUrl: 'https://api.test.com',
    });
    mockContext.getNodeParameter
      .mockReturnValueOnce('test-model')  // model
      .mockReturnValueOnce({ temperature: 0.5 });  // options

    const node = new LmChatCustom();
    const result = await node.supplyData.call(mockContext, 0);

    expect(result.response).toBeDefined();
    expect(result.response).toHaveProperty('invoke');
  });
});
```

### 9.2 Integration Testing

```typescript
describe('CustomAgent with Tools', () => {
  it('should execute with connected tools', async () => {
    const mockContext = mock<IExecuteFunctions>();
    const mockTool = {
      name: 'test_tool',
      description: 'Test tool',
      func: jest.fn().mockResolvedValue('tool result'),
    };

    mockContext.getInputConnectionData
      .mockResolvedValueOnce(mockModel)  // model
      .mockResolvedValueOnce(undefined)  // memory
      .mockResolvedValueOnce([mockTool]);  // tools

    const node = new CustomAgent();
    const result = await node.execute.call(mockContext);

    expect(result).toHaveLength(1);
    expect(result[0][0].json).toHaveProperty('output');
  });
});
```

---

## 10. Deployment Checklist

### 10.1 Before Publishing

- [ ] All connection types properly configured
- [ ] `supplyData` returns correct LangChain instance
- [ ] Error handling with `N8nLlmTracing` and `makeN8nLlmFailedAttemptHandler`
- [ ] Resource cleanup with `closeFunction` if needed
- [ ] Connection hints added for user guidance
- [ ] Credentials properly configured and tested
- [ ] Icons added (SVG format)
- [ ] Documentation updated
- [ ] Examples added to README
- [ ] Version number incremented
- [ ] Tests passing

### 10.2 Package.json Configuration

```json
{
  "n8n": {
    "n8nNodesApiVersion": 1,
    "credentials": [
      "dist/credentials/YourCredentials.credentials.js"
    ],
    "nodes": [
      "dist/nodes/YourChatModel.node.js",
      "dist/nodes/YourAgent.node.js"
    ]
  }
}
```

---

## 11. Additional Resources

### 11.1 Official Documentation

- [n8n Nodes Development](https://docs.n8n.io/integrations/creating-nodes/)
- [LangChain Documentation](https://js.langchain.com/docs/)
- [n8n Community Forum](https://community.n8n.io/)

### 11.2 Example Implementations in n8n

- `@n8n/nodes-langchain/nodes/llms/LMChatOpenAi/LmChatOpenAi.node.ts`
- `@n8n/nodes-langchain/nodes/agents/Agent/Agent.node.ts`
- `@n8n/nodes-langchain/nodes/tools/ToolCode/ToolCode.node.ts`
- `@n8n/nodes-langchain/nodes/memory/MemoryBufferWindow/MemoryBufferWindow.node.ts`

### 11.3 Key Helper Functions

Located in `@n8n/nodes-langchain/utils/helpers.ts`:
- `getConnectedTools()` - Get and validate tools
- `getSessionId()` - Extract session ID for memory
- `isChatInstance()` - Type guard for chat models
- `escapeSingleCurlyBrackets()` - Escape LangChain syntax

---

## Conclusion

Building custom AI agent nodes for n8n requires understanding:

1. **Sub-node architecture** - using `supplyData` to provide LangChain instances
2. **Connection types** - proper source/target relationships
3. **Tool integration** - automatic wrapping and validation
4. **Memory management** - session handling and persistence
5. **Best practices** - error handling, logging, and resource cleanup

The key is following n8n's established patterns rather than inventing new approaches. Study the official implementations, use the helper utilities, and always test with real workflows.
