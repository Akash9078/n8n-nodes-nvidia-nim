# Bug Fix Summary - Invalid URL Error

## Issue
Users were encountering an "Invalid URL" error when trying to use the NVIDIA NIM node in n8n.

### Error Details
```
{
  "errorMessage": "Invalid URL",
  "n8nDetails": {
    "nodeName": "Create a chat completion",
    "nodeType": "n8n-nodes-nvidia-nim.nvidiaNim",
    "nodeVersion": 1,
    "resource": "chat",
    "operation": "create"
  }
}
```

## Root Cause
The node was calling `this.helpers.requestWithAuthentication()` with only a relative URL path (e.g., `/chat/completions`) without specifying the `baseURL` from credentials. This caused n8n's HTTP request helper to fail because it couldn't construct a valid full URL.

**Before (Broken Code):**
```typescript
responseData = await this.helpers.requestWithAuthentication.call(
    this,
    'nvidiaNimApi',
    {
        method: 'POST',
        url: '/chat/completions',  // ❌ Missing baseURL!
        body,
        json: true,
    },
);
```

## Solution
Added `baseURL` parameter to all API requests by fetching it from credentials:

**After (Fixed Code):**
```typescript
responseData = await this.helpers.requestWithAuthentication.call(
    this,
    'nvidiaNimApi',
    {
        method: 'POST',
        baseURL: (await this.getCredentials('nvidiaNimApi')).baseUrl as string,  // ✅ Now includes baseURL
        url: '/chat/completions',
        body,
        json: true,
    },
);
```

## Changes Made

### Files Modified
1. **nodes/NvidiaNim/NvidiaNim.node.ts**
   - Added `baseURL` parameter to all 4 API endpoints:
     - Chat completions (`/chat/completions`)
     - Text completions (`/completions`)
     - Embeddings (`/embeddings`)
     - List models (`/models`)

2. **package.json**
   - Updated version from `1.0.0` to `1.0.1`

### Technical Implementation
The fix retrieves the `baseUrl` from user credentials inline with the API call:
```typescript
baseURL: (await this.getCredentials('nvidiaNimApi')).baseUrl as string
```

This ensures the full URL is constructed correctly, e.g.:
- Base URL from credentials: `https://integrate.api.nvidia.com/v1`
- Relative path: `/chat/completions`
- **Final URL**: `https://integrate.api.nvidia.com/v1/chat/completions` ✅

## Testing
- ✅ Build successful: `npm run build`
- ✅ Linting passed: `npm run lint`
- ✅ Published to npm: `n8n-nodes-nvidia-nim@1.0.1`
- ✅ Pushed to GitHub: [commit 13c7ae5]

## How to Update
Users experiencing the "Invalid URL" error should update to version 1.0.1:

### Via n8n UI
1. Go to Settings → Community Nodes
2. Find `n8n-nodes-nvidia-nim`
3. Click "Update" if available
4. Restart n8n

### Via npm
```bash
cd ~/.n8n/nodes
npm update n8n-nodes-nvidia-nim
```

## Verification
After updating, users should be able to:
1. Create chat completions without "Invalid URL" errors
2. Generate text completions successfully
3. Create embeddings properly
4. List available models correctly

## Package Links
- **npm**: https://www.npmjs.com/package/n8n-nodes-nvidia-nim
- **GitHub**: https://github.com/Akash9078/n8n-nodes-nvidia-nim
- **Version**: 1.0.1 (published October 4, 2025)

---

**Fixed by**: Python regex script (`fix_urls.py`)  
**Published**: Successfully published to npm registry as version 1.0.1
