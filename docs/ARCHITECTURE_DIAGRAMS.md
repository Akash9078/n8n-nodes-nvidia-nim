# NVIDIA NIM AI Agent Architecture Diagrams

## 1. Overall System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        n8n Workflow                              │
│                                                                  │
│  ┌──────────────┐       ┌──────────────────────────────────┐  │
│  │ Manual       │       │   NVIDIA NIM AI Agent Node        │  │
│  │ Trigger      │──────▶│                                   │  │
│  │              │       │  ┌─────────────────────────────┐  │  │
│  └──────────────┘       │  │    AgentExecutor            │  │  │
│                         │  │  (LangChain ReAct Pattern)  │  │  │
│                         │  └─────────────────────────────┘  │  │
│                         │                                    │  │
│                         │  Inputs (Connections):             │  │
│                         │  ├─ ai_languageModel (required)   │  │
│                         │  ├─ ai_memory (optional)          │  │
│                         │  └─ ai_tool (optional, multiple)  │  │
│                         └──────────────────────────────────┘  │
│                                      │                          │
│                                      ▼                          │
│                         ┌──────────────────────────────────┐  │
│                         │     Output Node                  │  │
│                         │  - Agent response                │  │
│                         │  - Execution time                │  │
│                         │  - Metadata                      │  │
│                         │  - Intermediate steps (optional) │  │
│                         └──────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## 2. Connection Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                  NVIDIA NIM AI Agent Node                        │
│                                                                  │
│  Input Connections:                                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                          │   │
│  │  ┌────────────────────────────────────────────────┐     │   │
│  │  │  1. Main Input (NodeConnectionTypes.Main)      │     │   │
│  │  │     - Workflow data from previous node         │     │   │
│  │  │     - Contains: $json.chatInput, session data │     │   │
│  │  └────────────────────────────────────────────────┘     │   │
│  │                                                          │   │
│  │  ┌────────────────────────────────────────────────┐     │   │
│  │  │  2. Chat Model (ai_languageModel) ⚠️ REQUIRED │     │   │
│  │  │     - NVIDIA NIM Chat Model Sub-Node           │     │   │
│  │  │     - Provides: ChatOpenAI instance            │     │   │
│  │  │     - Max Connections: 1                       │     │   │
│  │  └────────────────────────────────────────────────┘     │   │
│  │                          ▲                               │   │
│  │                          │                               │   │
│  │                 LmChatNvidiaNim.node.ts                 │   │
│  │                 (supplyData pattern)                     │   │
│  │                                                          │   │
│  │  ┌────────────────────────────────────────────────┐     │   │
│  │  │  3. Memory (ai_memory) ✓ OPTIONAL             │     │   │
│  │  │     - Window Buffer Memory                     │     │   │
│  │  │     - Conversation Buffer Memory               │     │   │
│  │  │     - Conversation Summary Memory              │     │   │
│  │  │     - Max Connections: 1                       │     │   │
│  │  └────────────────────────────────────────────────┘     │   │
│  │                                                          │   │
│  │  ┌────────────────────────────────────────────────┐     │   │
│  │  │  4. Tools (ai_tool) ✓ OPTIONAL                │     │   │
│  │  │     - Calculator Tool                          │     │   │
│  │  │     - Web Search Tool (Tavily)                 │     │   │
│  │  │     - Retriever Tool (Vector Store)            │     │   │
│  │  │     - HTTP Request Tool                        │     │   │
│  │  │     - Custom Tools                             │     │   │
│  │  │     - Max Connections: Unlimited               │     │   │
│  │  └────────────────────────────────────────────────┘     │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Output Connection:                                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Main Output (NodeConnectionTypes.Main)                 │   │
│  │  - Agent response text                                  │   │
│  │  - Execution time (ms)                                  │   │
│  │  - Metadata (model, tools, iterations)                  │   │
│  │  - Optional: intermediate steps (tool calls)            │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## 3. Agent Execution Flow (ReAct Pattern)

```
┌───────────────────────────────────────────────────────────────┐
│                    User Input                                  │
│           "What's 42 x 7 and weather in SF?"                   │
└───────────────────────┬───────────────────────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────────────────────┐
│              1. AGENT RECEIVES INPUT                           │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Input Processing:                                        │  │
│  │ - Validate connections (model, memory, tools)           │  │
│  │ - Prepare system message                                │  │
│  │ - Load conversation history (if memory connected)       │  │
│  └─────────────────────────────────────────────────────────┘  │
└───────────────────────┬───────────────────────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────────────────────┐
│              2. AGENT REASONS (LLM Call #1)                    │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ LLM Thinks:                                              │  │
│  │ "I need to:                                             │  │
│  │  1. Calculate 42 x 7 using calculator tool             │  │
│  │  2. Search weather in SF using web search tool"        │  │
│  │                                                          │  │
│  │ Decision: Call calculator tool first                    │  │
│  └─────────────────────────────────────────────────────────┘  │
└───────────────────────┬───────────────────────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────────────────────┐
│              3. TOOL EXECUTION #1                              │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Tool: Calculator                                         │  │
│  │ Input: { a: 42, b: 7 }                                  │  │
│  │ Action: multiply(42, 7)                                 │  │
│  │ Output: 294                                             │  │
│  └─────────────────────────────────────────────────────────┘  │
└───────────────────────┬───────────────────────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────────────────────┐
│              4. AGENT REASONS (LLM Call #2)                    │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ LLM Thinks:                                              │  │
│  │ "Good! 42 x 7 = 294.                                    │  │
│  │  Now I need to search for SF weather"                   │  │
│  │                                                          │  │
│  │ Decision: Call web search tool                          │  │
│  └─────────────────────────────────────────────────────────┘  │
└───────────────────────┬───────────────────────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────────────────────┐
│              5. TOOL EXECUTION #2                              │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Tool: Web Search (Tavily)                               │  │
│  │ Input: { query: "weather San Francisco" }              │  │
│  │ Action: search_web("weather San Francisco")            │  │
│  │ Output: "Current weather: 65°F, Sunny"                 │  │
│  └─────────────────────────────────────────────────────────┘  │
└───────────────────────┬───────────────────────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────────────────────┐
│              6. AGENT REASONS (LLM Call #3)                    │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ LLM Thinks:                                              │  │
│  │ "Perfect! I have both pieces of information:           │  │
│  │  - 42 x 7 = 294                                        │  │
│  │  - SF weather: 65°F, Sunny                             │  │
│  │                                                          │  │
│  │ Decision: Provide final answer to user"                │  │
│  └─────────────────────────────────────────────────────────┘  │
└───────────────────────┬───────────────────────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────────────────────┐
│              7. FINAL RESPONSE                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Output:                                                  │  │
│  │ {                                                        │  │
│  │   "output": "42 multiplied by 7 equals 294.            │  │
│  │              The current weather in San Francisco       │  │
│  │              is 65°F and sunny.",                       │  │
│  │   "executionTime": 3420,                               │  │
│  │   "metadata": {                                         │  │
│  │     "modelUsed": "ChatOpenAI",                         │  │
│  │     "memoryUsed": false,                               │  │
│  │     "toolsAvailable": ["calculator", "tavily_search"], │  │
│  │     "iterations": 2                                     │  │
│  │   }                                                      │  │
│  │ }                                                        │  │
│  └─────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────┘
```

## 4. Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                      NVIDIA NIM AI AGENT                          │
│                                                                   │
│  ┌─────────────┐                                                 │
│  │   INPUT     │                                                 │
│  │  ──────     │                                                 │
│  │ Text: str   │                                                 │
│  │ Thread: str │                                                 │
│  │ Options:    │                                                 │
│  │  - system   │                                                 │
│  │  - maxIter  │                                                 │
│  │  - verbose  │                                                 │
│  └──────┬──────┘                                                 │
│         │                                                         │
│         ▼                                                         │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              VALIDATION LAYER                            │    │
│  │  ┌────────────────────────────────────────────────────┐ │    │
│  │  │ ✓ Chat Model connected?                           │ │    │
│  │  │ ✓ Chat Model has invoke()?                        │ │    │
│  │  │ ✓ Text input valid?                               │ │    │
│  │  └────────────────────────────────────────────────────┘ │    │
│  └───────────────────────┬─────────────────────────────────┘    │
│                          │                                       │
│                          ▼                                       │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │           COMPONENT ASSEMBLY                             │    │
│  │  ┌────────────────────────────────────────────────────┐ │    │
│  │  │ Chat Model ───────────────────┐                   │ │    │
│  │  │ Memory (optional) ────────────┤                   │ │    │
│  │  │ Tools (optional, array) ──────┼──▶ AgentExecutor │ │    │
│  │  │ Prompt Template ──────────────┤                   │ │    │
│  │  │ Max Iterations ───────────────┘                   │ │    │
│  │  └────────────────────────────────────────────────────┘ │    │
│  └───────────────────────┬─────────────────────────────────┘    │
│                          │                                       │
│                          ▼                                       │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              AGENT EXECUTION                             │    │
│  │  ┌────────────────────────────────────────────────────┐ │    │
│  │  │                                                     │ │    │
│  │  │  ┌──────────┐      ┌──────────┐      ┌─────────┐ │ │    │
│  │  │  │          │      │          │      │         │ │ │    │
│  │  │  │   LLM    │─────▶│  Tools   │─────▶│   LLM   │ │ │    │
│  │  │  │  Call 1  │      │  Call    │      │  Call 2 │ │ │    │
│  │  │  │          │      │          │      │         │ │ │    │
│  │  │  └──────────┘      └──────────┘      └─────────┘ │ │    │
│  │  │       │                 │                  │      │ │    │
│  │  │       │                 │                  │      │ │    │
│  │  │       ▼                 ▼                  ▼      │ │    │
│  │  │  [Reasoning]        [Action]          [Response] │ │    │
│  │  │                                                   │ │    │
│  │  └────────────────────────────────────────────────────┘ │    │
│  └───────────────────────┬─────────────────────────────────┘    │
│                          │                                       │
│                          ▼                                       │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              OUTPUT FORMATTING                           │    │
│  │  ┌────────────────────────────────────────────────────┐ │    │
│  │  │ {                                                  │ │    │
│  │  │   output: string,                                 │ │    │
│  │  │   executionTime: number,                          │ │    │
│  │  │   metadata: {                                     │ │    │
│  │  │     modelUsed, memoryUsed,                        │ │    │
│  │  │     toolsAvailable, iterations                    │ │    │
│  │  │   },                                              │ │    │
│  │  │   intermediateSteps?: [{                          │ │    │
│  │  │     action, input, output                         │ │    │
│  │  │   }]                                              │ │    │
│  │  │ }                                                  │ │    │
│  │  └────────────────────────────────────────────────────┘ │    │
│  └───────────────────────┬─────────────────────────────────┘    │
│                          │                                       │
│                          ▼                                       │
│  ┌─────────────┐                                                │
│  │   OUTPUT    │                                                │
│  │  ────────   │                                                │
│  │  JSON with  │                                                │
│  │  response   │                                                │
│  │  + metadata │                                                │
│  └─────────────┘                                                │
└──────────────────────────────────────────────────────────────────┘
```

## 5. Error Handling Flow

```
┌─────────────────────────────────────────────────────────────┐
│                 ERROR HANDLING HIERARCHY                     │
│                                                              │
│  User Input                                                  │
│      │                                                       │
│      ▼                                                       │
│  ┌─────────────────────────────────────────────┐           │
│  │ 1. CONNECTION VALIDATION                    │           │
│  │                                              │           │
│  │  ❌ No Chat Model?                          │           │
│  │  └─▶ NodeOperationError: "No Chat Model    │           │
│  │      connected. Please connect..."          │           │
│  │                                              │           │
│  │  ❌ Invalid Chat Model?                     │           │
│  │  └─▶ NodeOperationError: "Connected node   │           │
│  │      is not a valid Chat Model..."          │           │
│  └─────────────────────────────────────────────┘           │
│      │                                                       │
│      ▼ (✅ Connections valid)                               │
│  ┌─────────────────────────────────────────────┐           │
│  │ 2. INPUT VALIDATION                         │           │
│  │                                              │           │
│  │  ❌ Empty text?                             │           │
│  │  └─▶ NodeOperationError: "Text parameter   │           │
│  │      is required and must be non-empty"     │           │
│  └─────────────────────────────────────────────┘           │
│      │                                                       │
│      ▼ (✅ Input valid)                                     │
│  ┌─────────────────────────────────────────────┐           │
│  │ 3. AGENT EXECUTION                          │           │
│  │                                              │           │
│  │  ❌ Tool execution fails?                   │           │
│  │  └─▶ handleParsingErrors: true              │           │
│  │      (Continue with error message)          │           │
│  │                                              │           │
│  │  ❌ Max iterations exceeded?                │           │
│  │  └─▶ Stop execution, return partial result │           │
│  │                                              │           │
│  │  ❌ LLM API error?                          │           │
│  │  └─▶ Caught by try-catch below              │           │
│  └─────────────────────────────────────────────┘           │
│      │                                                       │
│      ▼ (❌ Execution error)                                 │
│  ┌─────────────────────────────────────────────┐           │
│  │ 4. ERROR RECOVERY                           │           │
│  │                                              │           │
│  │  continueOnFail enabled?                    │           │
│  │  ├─▶ YES: Return error as output           │           │
│  │  │   {                                      │           │
│  │  │     error: "error message",              │           │
│  │  │     errorType: "ErrorName",              │           │
│  │  │     item: itemIndex                      │           │
│  │  │   }                                      │           │
│  │  │                                          │           │
│  │  └─▶ NO: Throw NodeOperationError          │           │
│  │      with detailed context                  │           │
│  └─────────────────────────────────────────────┘           │
│                                                              │
│  RESULT: Graceful degradation or informative error         │
└─────────────────────────────────────────────────────────────┘
```

## 6. Tool Integration Pattern

```
┌──────────────────────────────────────────────────────────────┐
│                   TOOL INTEGRATION                            │
│                                                               │
│  n8n Workflow Setup:                                         │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                                                      │    │
│  │  [Calculator Tool Node]                             │    │
│  │        │                                             │    │
│  │        │ ai_tool connection                         │    │
│  │        ├──────────────┐                              │    │
│  │        │              │                              │    │
│  │  [Web Search Tool]    │                             │    │
│  │        │              │                              │    │
│  │        │ ai_tool      │                              │    │
│  │        ├──────────┐   │                              │    │
│  │        │          │   │                              │    │
│  │  [Retriever Tool]│   │                              │    │
│  │        │          │   │                              │    │
│  │        │ ai_tool  │   │                              │    │
│  │        ├──────┐   │   │                              │    │
│  │        │      │   │   │                              │    │
│  │        ▼      ▼   ▼   ▼                              │    │
│  │  ┌─────────────────────────────────┐                │    │
│  │  │   NVIDIA NIM AI Agent Node      │                │    │
│  │  │                                  │                │    │
│  │  │  Tools Array: [                 │                │    │
│  │  │    { name: "calculator",        │                │    │
│  │  │      description: "...",         │                │    │
│  │  │      invoke: fn },               │                │    │
│  │  │    { name: "web_search",        │                │    │
│  │  │      description: "...",         │                │    │
│  │  │      invoke: fn },               │                │    │
│  │  │    { name: "retriever",         │                │    │
│  │  │      description: "...",         │                │    │
│  │  │      invoke: fn }                │                │    │
│  │  │  ]                               │                │    │
│  │  └─────────────────────────────────┘                │    │
│  │                                                      │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  Agent's Tool Selection Process:                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                                                      │    │
│  │  User: "What's the weather and 5+3?"                │    │
│  │         │                                            │    │
│  │         ▼                                            │    │
│  │  LLM analyzes available tools:                      │    │
│  │  ┌──────────────────────────────────────┐          │    │
│  │  │ calculator: "Perform math operations"│          │    │
│  │  │ web_search: "Search web for current" │          │    │
│  │  │ retriever: "Search knowledge base"   │          │    │
│  │  └──────────────────────────────────────┘          │    │
│  │         │                                            │    │
│  │         ▼                                            │    │
│  │  LLM decides:                                       │    │
│  │  1. Use calculator for "5+3"                        │    │
│  │  2. Use web_search for "weather"                    │    │
│  │         │                                            │    │
│  │         ▼                                            │    │
│  │  Tool calls executed in sequence                    │    │
│  │         │                                            │    │
│  │         ▼                                            │    │
│  │  Results combined: "5+3=8, Weather is 65°F"        │    │
│  │                                                      │    │
│  └─────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
```

## 7. Memory Management Pattern

```
┌──────────────────────────────────────────────────────────────┐
│                  MEMORY MANAGEMENT                            │
│                                                               │
│  WITHOUT Memory:                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                                                      │    │
│  │  User: "My name is John"                            │    │
│  │  Agent: "Nice to meet you!"                         │    │
│  │                                                      │    │
│  │  User: "What's my name?"                            │    │
│  │  Agent: "I don't have access to that information"  │    │
│  │          ❌ NO CONTEXT                              │    │
│  │                                                      │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  WITH Memory (Window Buffer):                                │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                                                      │    │
│  │  [Window Buffer Memory Node]                        │    │
│  │         │                                            │    │
│  │         │ ai_memory connection                      │    │
│  │         ▼                                            │    │
│  │  [NVIDIA NIM AI Agent Node]                         │    │
│  │                                                      │    │
│  │  User: "My name is John"                            │    │
│  │  Agent: "Nice to meet you, John!"                   │    │
│  │  ┌─────────────────────────────────────┐           │    │
│  │  │ Memory Buffer:                      │           │    │
│  │  │ [User: "My name is John",           │           │    │
│  │  │  Agent: "Nice to meet you, John!"]  │           │    │
│  │  └─────────────────────────────────────┘           │    │
│  │                                                      │    │
│  │  User: "What's my name?"                            │    │
│  │  Agent: "Your name is John."                        │    │
│  │         ✅ CONTEXT PRESERVED                        │    │
│  │                                                      │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  Memory Types Available:                                     │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                                                      │    │
│  │  1. Window Buffer Memory                            │    │
│  │     - Keeps last N messages                         │    │
│  │     - Good for: Short conversations                 │    │
│  │                                                      │    │
│  │  2. Conversation Buffer Memory                      │    │
│  │     - Keeps all messages                            │    │
│  │     - Good for: Context-rich conversations          │    │
│  │                                                      │    │
│  │  3. Conversation Summary Memory                     │    │
│  │     - Summarizes old messages                       │    │
│  │     - Good for: Long conversations                  │    │
│  │                                                      │    │
│  └─────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
```

## Legend

```
Symbols Used:
─────────────────────────────────────
│  │    = Vertical connection
├──┤    = Split/merge connection
▼  ▲    = Flow direction
┌──┐    = Box/container
✅      = Success/Valid
❌      = Error/Invalid
⚠️      = Warning/Required
🔧      = Configuration
📊      = Data/Output
```

---

**Last Updated**: October 2025  
**Version**: 1.0  
**Purpose**: Visual documentation of NVIDIA NIM AI Agent architecture
