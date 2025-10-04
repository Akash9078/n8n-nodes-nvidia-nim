# Quick Setup Guide

Follow these steps to build, test, and publish your NVIDIA NIM n8n community node.

## 📋 Prerequisites Checklist

- [ ] Node.js v18.17.0 or higher installed
- [ ] npm installed
- [ ] n8n installed (for testing)
- [ ] NVIDIA NGC account created
- [ ] NVIDIA API key generated
- [ ] Git installed (for version control)

## 🚀 Step 1: Install Dependencies

```powershell
cd "c:\Users\Akash naik\Desktop\nvidia-nim\n8n-nodes-nvidia-nim"
npm install
```

This will install all required dependencies:
- `n8n-workflow` - n8n workflow types
- `typescript` - TypeScript compiler
- `eslint` - Code linter
- `prettier` - Code formatter
- `gulp` - Build task runner

## 🔨 Step 2: Build the Project

```powershell
npm run build
```

This command will:
1. Compile TypeScript files to JavaScript
2. Copy icon files to the `dist` folder
3. Generate type declarations
4. Create source maps

Expected output structure:
```
dist/
├── credentials/
│   ├── NvidiaNimApi.credentials.js
│   ├── NvidiaNimApi.credentials.d.ts
│   └── NvidiaNimApi.credentials.js.map
└── nodes/
    └── NvidiaNim/
        ├── NvidiaNim.node.js
        ├── NvidiaNim.node.d.ts
        ├── NvidiaNim.node.js.map
        └── nvidia-nim.svg
```

## 🧪 Step 3: Test Locally with n8n

### Option A: Link for Development

```powershell
# In the package directory
npm link

# In your n8n installation directory
cd ~/.n8n
npm link n8n-nodes-nvidia-nim

# Restart n8n
n8n start
```

### Option B: Install Directly

```powershell
# Copy the package to n8n custom directory
mkdir -p ~/.n8n/custom
cp -r "c:\Users\Akash naik\Desktop\nvidia-nim\n8n-nodes-nvidia-nim" ~/.n8n/custom/

# Install in n8n
cd ~/.n8n/custom/n8n-nodes-nvidia-nim
npm install
npm run build

# Restart n8n
n8n start
```

## 🔧 Step 4: Configure in n8n

1. **Open n8n** in your browser (usually `http://localhost:5678`)

2. **Add Credentials**:
   - Go to **Credentials** → **New**
   - Search for "NVIDIA NIM API"
   - Enter your API key from [ngc.nvidia.com](https://ngc.nvidia.com)
   - Set Base URL: `https://integrate.api.nvidia.com/v1`
   - Click **Save**

3. **Test the Node**:
   - Create a new workflow
   - Add the "NVIDIA NIM" node
   - Select your credentials
   - Configure a simple chat completion
   - Execute the workflow

## ✅ Step 5: Verify Installation

Create a test workflow with these nodes:

```
[Manual Trigger] → [NVIDIA NIM] → [Code]
```

**NVIDIA NIM Configuration**:
- Resource: Chat
- Operation: Create
- Model: `meta/llama3-8b-instruct`
- Messages:
  - Role: user
  - Content: "Say hello!"

Click **Execute** and verify you get a response.

## 📦 Step 6: Prepare for Publishing

### Update package.json

Before publishing, update these fields in `package.json`:

```json
{
  "name": "n8n-nodes-nvidia-nim",
  "version": "1.0.0",
  "author": {
    "name": "Your Name",
    "email": "your.email@example.com"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/YOUR-USERNAME/n8n-nodes-nvidia-nim.git"
  },
  "homepage": "https://github.com/YOUR-USERNAME/n8n-nodes-nvidia-nim"
}
```

### Run Quality Checks

```powershell
# Lint the code
npm run lint

# Format the code
npm run format

# Build for production
npm run build
```

### Initialize Git Repository

```powershell
git init
git add .
git commit -m "Initial commit: NVIDIA NIM n8n community node"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/n8n-nodes-nvidia-nim.git
git push -u origin main
```

## 🚀 Step 7: Publish to npm

### First-Time Setup

```powershell
# Login to npm
npm login

# Verify your login
npm whoami
```

### Publish the Package

```powershell
# Make sure everything is built
npm run build

# Publish to npm
npm publish
```

### Verify Publication

1. Check on npm: `https://www.npmjs.com/package/n8n-nodes-nvidia-nim`
2. Test installation from npm:
   ```powershell
   npm install n8n-nodes-nvidia-nim
   ```

## 🔄 Step 8: Publish Updates

When you make changes:

```powershell
# Update version in package.json (follow semver)
# - 1.0.1 for bug fixes
# - 1.1.0 for new features
# - 2.0.0 for breaking changes

# Update CHANGELOG.md with changes

# Commit changes
git add .
git commit -m "Version 1.0.1: Bug fixes"
git tag v1.0.1
git push origin main --tags

# Publish to npm
npm run build
npm publish
```

## 🎯 Testing Checklist

Before publishing, test these scenarios:

- [ ] Chat completion with single message
- [ ] Chat completion with multiple messages (conversation)
- [ ] Text completion with custom parameters
- [ ] Embedding generation
- [ ] Model listing
- [ ] Error handling (invalid API key, wrong model name)
- [ ] All additional options (temperature, max_tokens, etc.)
- [ ] Credential test function
- [ ] Icon displays correctly
- [ ] Node subtitle updates correctly

## 🐛 Troubleshooting

### "Cannot find module 'n8n-workflow'"

This is expected during development. The module will be available when installed in n8n.

### Node doesn't appear in n8n

1. Check if `dist` folder exists
2. Verify `package.json` has correct `n8n` section
3. Restart n8n completely
4. Clear browser cache

### Build errors

```powershell
# Clean and rebuild
rm -rf dist node_modules
npm install
npm run build
```

### API errors

1. Verify API key is correct
2. Check Base URL is: `https://integrate.api.nvidia.com/v1`
3. Test API key directly:
   ```powershell
   curl -H "Authorization: Bearer YOUR_API_KEY" https://integrate.api.nvidia.com/v1/models
   ```

## 📚 Additional Resources

- [n8n Community Nodes Documentation](https://docs.n8n.io/integrations/creating-nodes/build/declarative-style-node/)
- [NVIDIA NIM API Documentation](https://docs.nvidia.com/nim/)
- [npm Publishing Guide](https://docs.npmjs.com/creating-and-publishing-unscoped-public-packages)
- [Semantic Versioning](https://semver.org/)

## 🎉 Success!

Once published, users can install your node in n8n:

1. **Via n8n UI**: Settings → Community Nodes → Install → `n8n-nodes-nvidia-nim`
2. **Via CLI**: `npm install n8n-nodes-nvidia-nim`

---

**Need help?** Open an issue on GitHub or check the documentation files in this project.
