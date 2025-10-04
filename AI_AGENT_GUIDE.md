# AI Agent Implementation Guide: Memory & Tools

## Overview

This guide explains how to build **production-ready AI agents** with NVIDIA NIM using best practices for memory management, tool use, and multi-turn conversations. Based on 2025 industry standards from Anthropic, OpenAI, and LangChain research.

## What Makes a Real AI Agent?

An AI agent is more than just a chatbot. True agents have:

1. **Persistent Memory** - Remember facts across sessions
2. **Tool Use** - Execute functions and APIs autonomously
3. **Multi-Turn Reasoning** - Maintain context through complex workflows
4. **Goal-Oriented Behavior** - Work towards objectives over time

## Message Roles Explained

### System Role
**Purpose:** Set AI behavior and provide context that should ALWAYS be present.

```
Role: System
Content: "You are a helpful customer support agent. Always be polite and ask clarifying questions."
```

**Best Practices:**
- Keep system prompts concise but complete
- Include core behavioral guidelines
- Don't repeat information - system stays in context

### User Role
**Purpose:** User questions, requests, and inputs.

```
Role: User
Content: "What's the weather in Tokyo?"
```

### Assistant Role  ⭐ IMPORTANT FOR AGENTS
**Purpose:** AI's previous responses, INCLUDING tool call requests.

**When Tool Calls Are Made:**
```json
{
  "role": "assistant",
  "content": null,
  "tool_calls": [{
    "id": "call_abc123",
    "type": "function",
    "function": {
      "name": "get_weather",
      "arguments": "{\"location\": \"Tokyo, Japan\"}"
    }
  }]
}
```

**Why This Matters:**
- You MUST add the assistant's tool call message to conversation history
- Without it, the model loses context of what tools it called
- This enables multi-step reasoning and tool orchestration

### Tool Role ⭐ NEW IN v1.2.0
**Purpose:** Send function execution results back to the model.

```
Role: Tool
Content: {"temperature": 22, "condition": "sunny", "humidity": 65}
Tool Call ID: call_abc123
Tool Call Name: get_weather
```

**Critical Fields:**
- `tool_call_id`: Must match the ID from assistant's tool_calls
- `name`: The function name that was executed
- `content`: The actual result (can be JSON string or text)

## The Agent Workflow Pattern

### 1. Initial Request
```
[1] User: "What's the weather in Tokyo and New York?"
```

### 2. Model Responds with Tool Calls
```
[2] Assistant: (tool_calls: [
      {id: "call_001", function: {name: "get_weather", args: '{"location": "Tokyo"}'}},
      {id: "call_002", function: {name: "get_weather", args: '{"location": "New York"}'}}
    ])
```

### 3. Execute Tools & Send Results
```
[3] Tool: (tool_call_id: "call_001", name: "get_weather")
    Content: "Tokyo: 22°C, Sunny"
    
[4] Tool: (tool_call_id: "call_002", name: "get_weather")
    Content: "New York: 15°C, Cloudy"
```

### 4. Model Synthesizes Final Answer
```
[5] Assistant: "In Tokyo it's 22°C and sunny. In New York it's 15°C and cloudy."
```

## n8n Workflow Implementation

### Pattern 1: Single Tool Call Loop

```
┌─────────────────┐
│  NVIDIA NIM Node│
│  (Initial Call) │
└────────┬────────┘
         │ Output: tool_calls?
         ↓
    ┌────────┐
    │ IF Node│ ← Check: {{ $json.choices[0].message.tool_calls }}
    └────┬───┘
         │ YES: Tool calls exist
         ↓
┌────────────────────┐
│ Switch/Route Node  │ ← Route by function name
└────────┬───────────┘
         │
    ┌────↓─────┐
    │ HTTP Node│ ← Execute actual function
    └────┬─────┘
         │ Result
         ↓
┌──────────────────────┐
│ Set Node             │ ← Build tool message
│ Role: tool           │
│ tool_call_id: {{...}}│
│ Content: {{result}}  │
└──────────┬───────────┘
         │
         ↓
┌─────────────────┐
│  NVIDIA NIM Node│ ← Second call with tool results
│ (messages: [    │
│   ...history,   │
│   tool_message] │
│ )               │
└─────────────────┘
```

### Pattern 2: Multi-Turn Conversation with Memory

```
┌──────────────┐
│ Redis/Memory │ ← Store conversation history
│    Store     │
└──────┬───────┘
       │ Load history
       ↓
┌─────────────────┐
│  NVIDIA NIM     │
│  New message +  │
│  History        │
└────────┬────────┘
         │
         ↓
┌────────────────┐
│ Save to Memory │ ← Store assistant response
└────────────────┘
```

### Pattern 3: Agent Loop (Autonomous)

```
┌─────────┐
│  Start  │
└────┬────┘
     │
     ↓
┌────────────────────┐
│ Load Memory        │
└────────┬───────────┘
         │
         ↓
┌────────────────────┐
│ NVIDIA NIM         │
└────────┬───────────┘
         │
         ↓
┌─────────────────────┐
│ Tool calls present? │
└────────┬────────────┘
         │ YES
         ↓
┌─────────────────────┐
│ Execute All Tools   │
└────────┬────────────┘
         │
         ↓
┌─────────────────────┐
│ Add tool results    │
│ to messages         │
└────────┬────────────┘
         │
         └──► Loop back to NVIDIA NIM
              (Continue until no more tool calls)
```

## Memory Management Best Practices

### Problem: Context Window Limits
Every LLM has a maximum token limit. Long conversations exceed this quickly.

### Solution Approaches

#### 1. **Rolling Window** (Simple)
Keep only the last N messages:
```javascript
// In n8n Code node
const maxMessages = 10;
const recentMessages = conversationHistory.slice(-maxMessages);
```

**Pros:** Simple, preserves recent context  
**Cons:** Loses older important information

#### 2. **Summarization** (Intermediate)
Compress older messages into summaries:
```
[1-20]: <Summary: "User asked about products, received list of 10 items">
[21-25]: Full recent messages
```

**Pros:** Maintains some historical context  
**Cons:** Loses details, additional API call for summarization

#### 3. **Smart Memory Formation** (Advanced) ⭐ RECOMMENDED
Store specific facts, not full conversations:

```javascript
// Extract and store key facts
const memory = {
  user_preferences: ["likes jazz music", "vegetarian"],
  important_dates: ["meeting on 2025-10-15"],
  ongoing_tasks: ["researching AI agents"],
  tool_results: {
    "tokyo_weather_2025-10-04": "22°C sunny"
  }
};
```

**Pros:** Token-efficient (80-90% reduction), maintains long-term context  
**Cons:** Requires setup and fact extraction logic

#### 4. **Hierarchical Memory** (Production)
Different types of memory at different scales:

- **Working Memory:** Current conversation (last 5-10 messages)
- **Episodic Memory:** Important moments from past sessions
- **Semantic Memory:** General facts learned over time

### Implementation: Redis Memory Store

```javascript
// Store conversation
const conversationKey = `conv:${userId}:${sessionId}`;
await redis.lpush(conversationKey, JSON.stringify(message));
await redis.ltrim(conversationKey, 0, 49); // Keep last 50 messages

// Store facts
const factsKey = `facts:${userId}`;
await redis.hset(factsKey, 'preference:food', 'vegetarian');
await redis.hset(factsKey, 'timezone', 'Asia/Tokyo');

// Load for next message
const history = await redis.lrange(conversationKey, 0, 9); // Last 10
const userFacts = await redis.hgetall(factsKey);
```

## Tool Design Best Practices

### 1. **Keep Tools Focused**
❌ Bad: One mega-tool that does everything
```json
{
  "name": "database_operations",
  "parameters": {
    "operation": ["select", "insert", "update", "delete", "join", "aggregate"]
  }
}
```

✅ Good: Specific, single-purpose tools
```json
[
  {"name": "search_customers", "description": "Search for customers by name or email"},
  {"name": "get_order_history", "description": "Get order history for a customer ID"},
  {"name": "create_support_ticket", "description": "Create a new support ticket"}
]
```

### 2. **Write Clear Descriptions**
The model uses descriptions to decide WHEN to use a tool.

❌ Bad:
```json
{
  "name": "api_call",
  "description": "Makes API calls"
}
```

✅ Good:
```json
{
  "name": "get_customer_orders",
  "description": "Retrieves the complete order history for a specific customer. Use when user asks about past purchases, order status, or order details. Requires customer email or ID. Returns list of orders with date, items, and status."
}
```

### 3. **Use JSON Schema Properly**
```json
{
  "type": "object",
  "properties": {
    "customer_email": {
      "type": "string",
      "pattern": "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
      "description": "Customer's email address"
    },
    "start_date": {
      "type": "string",
      "format": "date",
      "description": "Start date for order search in YYYY-MM-DD format"
    },
    "limit": {
      "type": "integer",
      "minimum": 1,
      "maximum": 100,
      "default": 10
    }
  },
  "required": ["customer_email"]
}
```

### 4. **Return Structured Data**
Don't return raw HTML or unstructured text. Return clean JSON:

```javascript
// Tool result
{
  "success": true,
  "orders": [
    {"id": "ORD-001", "date": "2025-09-15", "total": 125.50, "status": "delivered"},
    {"id": "ORD-002", "date": "2025-10-01", "total": 89.99, "status": "shipped"}
  ],
  "total_count": 2
}
```

## Token Optimization Strategies

### 1. **Cache System Prompts**
Many providers support prompt caching:
```javascript
// Mark system prompt for caching
{
  "role": "system",
  "content": longSystemPrompt,
  "cache_control": {"type": "ephemeral"}
}
```

### 2. **Compress Tool Results**
Don't send back massive tool outputs:

❌ Bad:
```json
{
  "content": "... 50,000 tokens of raw data ..."
}
```

✅ Good:
```json
{
  "content": {
    "summary": "Found 150 customers matching query",
    "top_results": [...first 5...],
    "note": "Full results stored in temp_results_id_123"
  }
}
```

### 3. **Smart Context Retrieval**
Don't load everything upfront. Let the agent ask for what it needs:

```javascript
// Instead of loading all files
tools: [
  {name: "list_files", description: "List available files in directory"},
  {name: "read_file", description: "Read a specific file by name"},
  {name: "search_files", description: "Search file contents by keyword"}
]
```

## Production Checklist

### ✅ Memory
- [ ] Conversation history stored (Redis/Database)
- [ ] Message count or token limits enforced
- [ ] Important facts extracted and persisted
- [ ] Context cleared/summarized at appropriate intervals

### ✅ Tools
- [ ] Each tool has clear, specific purpose
- [ ] Tool descriptions explain WHEN to use them
- [ ] JSON schemas validate all parameters
- [ ] Tools return structured, parseable data
- [ ] Error handling for failed tool calls

### ✅ Agent Loop
- [ ] Assistant messages with tool_calls stored in history
- [ ] Tool results sent back with correct tool_call_id
- [ ] Loop continues until model stops requesting tools
- [ ] Maximum iteration limit prevents infinite loops

### ✅ Error Handling
- [ ] Handle invalid tool arguments
- [ ] Handle tool execution failures
- [ ] Handle API rate limits
- [ ] Provide helpful error messages to model

### ✅ Monitoring
- [ ] Log all conversations for debugging
- [ ] Track token usage per interaction
- [ ] Monitor tool call success rates
- [ ] Alert on excessive costs or errors

## Example: Complete Weather Agent

### n8n Workflow Steps:

**1. Trigger** (Webhook/Chat)
```
User input: "What's the weather in Tokyo?"
```

**2. Load Memory**
```javascript
// Code node
const userId = $('Webhook').item.json.userId;
const messages = await redis.lrange(`conv:${userId}`, 0, 9);
return [{json: {history: messages}}];
```

**3. NVIDIA NIM Call #1**
```
Resource: Chat
Model: meta/llama3-70b-instruct
Messages: 
  - Role: system
    Content: "You are a weather assistant. Use get_weather tool when asked about weather."
  - [...history...]
  - Role: user
    Content: "What's the weather in Tokyo?"

Tools:
  - Name: get_weather
    Description: "Get current weather for a location"
    Parameters: {"type": "object", "properties": {"location": {"type": "string"}}}

Tool Choice: auto
```

**4. Check for Tool Calls**
```javascript
// IF node expression
{{ $json.choices[0].message.tool_calls !== undefined }}
```

**5. Execute Weather API**
```javascript
// HTTP Request node or Code node
const toolCall = $json.choices[0].message.tool_calls[0];
const args = JSON.parse(toolCall.function.arguments);

const weather = await fetch(`https://api.weather.com/v1/current?location=${args.location}`);
return [{
  json: {
    tool_call_id: toolCall.id,
    name: toolCall.function.name,
    result: weather
  }
}];
```

**6. NVIDIA NIM Call #2** (with tool result)
```
Messages:
  - [...previous history...]
  - Role: assistant
    Content: null
    (automatically includes tool_calls from previous response)
  - Role: tool
    Tool Call ID: {{ $json.tool_call_id }}
    Tool Call Name: {{ $json.name }}
    Content: {{ $json.result }}
```

**7. Save to Memory**
```javascript
// Code node
await redis.lpush(`conv:${userId}`, 
  JSON.stringify($json.choices[0].message)
);
```

**8. Return to User**

## Advanced Patterns

### Multi-Agent Architecture
Break complex tasks into specialized sub-agents:

```
Main Agent (Coordinator)
  ├─> Research Agent (web search, analysis)
  ├─> Data Agent (database queries)
  └─> Action Agent (send emails, create tickets)
```

Each sub-agent returns condensed summaries to main agent.

### Streaming Responses
For better UX, stream responses as they're generated:
```javascript
{
  stream: true
}
```

Handle streaming in n8n with SSE (Server-Sent Events).

### Conditional Tool Loading
Don't send all 50 tools at once. Load relevant ones based on context:

```javascript
// Determine which tools to include
const tools = [];
if (context.includes('weather')) tools.push(weatherTool);
if (context.includes('email')) tools.push(emailTool);
if (context.includes('database')) tools.push(dbTools);
```

## Troubleshooting

### Model Not Using Tools
- ✅ Check tool descriptions are clear and specific
- ✅ Verify tool_choice is set to "auto" or "required"
- ✅ Ensure system prompt mentions tools are available
- ✅ Try with explicit instruction: "Use the available tools to answer this"

### Infinite Tool Call Loops
- ✅ Add max_iterations limit in workflow
- ✅ Check tool results are being properly formatted
- ✅ Ensure tool_call_id matches in tool messages
- ✅ Verify model receives tool results in correct format

### Context Window Exceeded
- ✅ Implement message history truncation
- ✅ Use summarization for older messages
- ✅ Store facts separately from full conversations
- ✅ Clear tool results after model processes them

### High Token Costs
- ✅ Enable prompt caching for system prompts
- ✅ Compress tool results before sending back
- ✅ Use smaller models for simple tool selection tasks
- ✅ Implement token budgets and limits

## Resources

- **OpenAI Function Calling:** https://platform.openai.com/docs/guides/function-calling
- **Anthropic Context Engineering:** https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
- **Mem0 Memory Management:** https://mem0.ai/blog/llm-chat-history-summarization-guide-2025
- **LangGraph Best Practices:** https://medium.com/predict/building-scalable-agent-systems-with-langgraph-best-practices-for-memory-streaming-durability-5eb360d162c3
- **n8n AI Agents:** https://n8n.io/workflows/ (search "AI agent")

---

**Version:** 1.2.0  
**Last Updated:** January 2025  
**Author:** Akash Kumar Naik

This guide reflects 2025 industry best practices for building production AI agents with proper memory management, tool orchestration, and multi-turn reasoning capabilities.
