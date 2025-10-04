# Function Calling / Tool Use Guide

## Overview

NVIDIA NIM now supports **function calling** (also known as **tool use**), enabling AI models to intelligently call external functions and tools. This powerful feature allows you to build AI agents that can:

- 🔍 Query APIs and databases
- 📧 Send emails and notifications
- 🌤️ Get real-time data (weather, stock prices, etc.)
- 🧮 Perform calculations and data processing
- 🔗 Integrate with external services
- 🤖 Build autonomous AI agents

## What is Function Calling?

Function calling allows the AI model to:
1. **Understand** when it needs external information or actions
2. **Generate** structured JSON with function names and arguments
3. **Return** tool call requests that your application can execute
4. **Process** the results to provide final answers

## How It Works

```
User Query → Model with Tools → Tool Calls Generated → 
Execute Tools → Results → Model Response
```

**Example Flow:**
1. User asks: "What's the weather in San Francisco?"
2. Model sees `get_weather` function is available
3. Model generates: `get_weather(location="San Francisco, CA", unit="fahrenheit")`
4. Your app executes the function and gets the weather
5. Model uses the result to answer: "It's 72°F and sunny in San Francisco"

## Setting Up Function Calling in n8n

### Step 1: Define Your Tools

In the NVIDIA NIM node, add tools using the **Tools** parameter:

**Tool Configuration:**
- **Function Name**: Unique identifier (e.g., `get_current_weather`)
- **Function Description**: Clear explanation of what the function does
- **Parameters**: JSON Schema describing the function's input parameters

### Step 2: Configure Tool Choice

The **Tool Choice** parameter controls how the model uses tools:

- **Auto** (recommended): Model decides whether to call functions
- **None**: Model won't call any functions (even if tools are defined)
- **Required**: Model must call one or more functions

## Examples

### Example 1: Weather Function

**Function Name:** `get_current_weather`

**Description:** `Get the current weather in a given location`

**Parameters (JSON Schema):**
```json
{
  "type": "object",
  "properties": {
    "location": {
      "type": "string",
      "description": "The city and state, e.g. San Francisco, CA"
    },
    "unit": {
      "type": "string",
      "enum": ["celsius", "fahrenheit"],
      "description": "Temperature unit"
    }
  },
  "required": ["location"]
}
```

**User Query:** "What's the temperature in New York?"

**Model Response (tool_calls):**
```json
{
  "choices": [{
    "message": {
      "role": "assistant",
      "content": null,
      "tool_calls": [{
        "id": "call_abc123",
        "type": "function",
        "function": {
          "name": "get_current_weather",
          "arguments": "{\"location\": \"New York, NY\", \"unit\": \"fahrenheit\"}"
        }
      }]
    }
  }]
}
```

### Example 2: Database Query Function

**Function Name:** `search_database`

**Description:** `Search the customer database for matching records`

**Parameters:**
```json
{
  "type": "object",
  "properties": {
    "query": {
      "type": "string",
      "description": "SQL-like search query"
    },
    "limit": {
      "type": "integer",
      "description": "Maximum number of results to return",
      "default": 10
    },
    "fields": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Fields to include in results"
    }
  },
  "required": ["query"]
}
```

### Example 3: Email Sending Function

**Function Name:** `send_email`

**Description:** `Send an email to a recipient`

**Parameters:**
```json
{
  "type": "object",
  "properties": {
    "to": {
      "type": "string",
      "description": "Email address of the recipient"
    },
    "subject": {
      "type": "string",
      "description": "Email subject line"
    },
    "body": {
      "type": "string",
      "description": "Email body content"
    }
  },
  "required": ["to", "subject", "body"]
}
```

### Example 4: Multi-Function Agent (Parallel Tool Calls)

Define multiple tools for a versatile AI agent:

**Tools:**
1. `get_weather` - Get weather information
2. `search_web` - Search the internet
3. `calculate` - Perform mathematical calculations
4. `send_notification` - Send alerts

**User Query:** "What's the weather in Tokyo and what's 25 * 48?"

**Model Response:**
```json
{
  "tool_calls": [
    {
      "function": {
        "name": "get_weather",
        "arguments": "{\"location\": \"Tokyo, Japan\"}"
      }
    },
    {
      "function": {
        "name": "calculate",
        "arguments": "{\"expression\": \"25 * 48\"}"
      }
    }
  ]
}
```

## Best Practices

### 1. Write Clear Function Descriptions
✅ **Good:** "Get the current weather forecast for a specified location with temperature, humidity, and conditions"

❌ **Bad:** "Weather function"

### 2. Use Descriptive Parameter Names
```json
{
  "location": "The city and state (e.g., San Francisco, CA)",
  "format": "Response format: 'json' or 'text'"
}
```

### 3. Specify Required vs Optional Parameters
```json
{
  "required": ["location"],
  "properties": {
    "location": {...},
    "unit": {...}  // Optional
  }
}
```

### 4. Use Enums for Limited Options
```json
{
  "unit": {
    "type": "string",
    "enum": ["celsius", "fahrenheit", "kelvin"]
  }
}
```

### 5. Provide Examples in Descriptions
```json
{
  "date": {
    "type": "string",
    "description": "Date in YYYY-MM-DD format, e.g., 2024-12-25"
  }
}
```

## Processing Tool Calls in n8n

When the model generates tool calls, the response includes a `tool_calls` array. Process it like this:

### Workflow Pattern:

```
[NVIDIA NIM Node with Tools]
    ↓
[Check if tool_calls exist]
    ↓ YES
[Switch Node - Route by function name]
    ↓
[Execute corresponding function]
    ↓
[Send results back to model]
    ↓
[Get final response]
```

### Example n8n Expression:
```javascript
// Check if tool calls exist
{{ $json.choices[0].message.tool_calls !== undefined }}

// Get function name
{{ $json.choices[0].message.tool_calls[0].function.name }}

// Parse function arguments
{{ JSON.parse($json.choices[0].message.tool_calls[0].function.arguments) }}
```

## Advanced Use Cases

### 1. Autonomous Agent
Create an agent that can search, analyze, and report:
- **Tools:** search_web, analyze_data, generate_report, send_email
- **Flow:** User asks → Search → Analyze → Generate report → Email results

### 2. Customer Support Bot
Build a bot that handles queries with actions:
- **Tools:** search_kb, create_ticket, update_order, send_sms
- **Flow:** Query → Search KB → If needed, create ticket or update order

### 3. Data Analysis Assistant
Enable natural language data queries:
- **Tools:** query_database, create_visualization, export_csv
- **Flow:** "Show me sales by region" → Query DB → Create chart → Export

### 4. MCP Integration (Model Context Protocol)
Connect to MCP servers for extended capabilities:
- **Tools:** Use MCP protocol to expose tools from remote servers
- **Use Cases:** Access company databases, internal APIs, specialized services

## Supported Models

NVIDIA NIM supports function calling with models that have OpenAI-compatible APIs:
- **Meta Llama 3.1** and **3.2** (JSON-based tool calling)
- **Meta Llama 4** (Pythonic and JSON tool calling)
- **Mistral Models** (7B+)
- **Other OpenAI-compatible models**

Check NVIDIA NIM documentation for the latest supported models.

## Troubleshooting

### Tool Not Being Called
- ✅ Ensure description clearly explains when to use the tool
- ✅ Use `tool_choice: "required"` to force tool calling
- ✅ Verify JSON schema is valid

### Invalid Arguments Generated
- ✅ Add more detailed parameter descriptions
- ✅ Use enums for limited options
- ✅ Include examples in descriptions

### Multiple Unwanted Tool Calls
- ✅ Use `tool_choice: "none"` or `"auto"`
- ✅ Make function descriptions more specific
- ✅ Guide the model with system messages

### JSON Parsing Errors
- ✅ Validate JSON schema syntax
- ✅ Check for missing commas or brackets
- ✅ Use online JSON validators

## JSON Schema Reference

### Basic Types
```json
{
  "string_param": { "type": "string" },
  "number_param": { "type": "number" },
  "integer_param": { "type": "integer" },
  "boolean_param": { "type": "boolean" },
  "array_param": { 
    "type": "array", 
    "items": { "type": "string" } 
  },
  "object_param": {
    "type": "object",
    "properties": { ... }
  }
}
```

### Constraints
```json
{
  "age": {
    "type": "integer",
    "minimum": 0,
    "maximum": 150
  },
  "email": {
    "type": "string",
    "pattern": "^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$"
  },
  "status": {
    "type": "string",
    "enum": ["active", "inactive", "pending"]
  }
}
```

## Resources

- **OpenAI Function Calling Docs:** https://platform.openai.com/docs/guides/function-calling
- **NVIDIA NIM Documentation:** https://docs.nvidia.com/nim/
- **JSON Schema Guide:** https://json-schema.org/understanding-json-schema/
- **Model Context Protocol:** https://modelcontextprotocol.io/

## Need Help?

- **GitHub Issues:** https://github.com/Akash9078/n8n-nodes-nvidia-nim/issues
- **n8n Community:** https://community.n8n.io/
- **NVIDIA Developer Forums:** https://forums.developer.nvidia.com/

---

**Version:** 1.1.0  
**Last Updated:** 2025  
**Author:** Akash Kumar Naik
