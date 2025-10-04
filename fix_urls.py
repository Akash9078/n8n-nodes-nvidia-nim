import re

# Read the file
with open('nodes/NvidiaNim/NvidiaNim.node.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern to match requestWithAuthentication calls and add baseURL
# We'll insert the credentials fetching and baseURL parameter

# Fix for chat completions
pattern1 = r"(// Make API request\s+responseData = await this\.helpers\.requestWithAuthentication\.call\(\s+this,\s+'nvidiaNimApi',\s+\{\s+method: 'POST',)\s+(url: '/chat/completions',)"
replacement1 = r"\1\n\t\t\t\t\tbaseURL: (await this.getCredentials('nvidiaNimApi')).baseUrl as string,\n\t\t\t\t\t\2"
content = re.sub(pattern1, replacement1, content)

# Fix for completions
pattern2 = r"(// Make API request\s+responseData = await this\.helpers\.requestWithAuthentication\.call\(\s+this,\s+'nvidiaNimApi',\s+\{\s+method: 'POST',)\s+(url: '/completions',)"
replacement2 = r"\1\n\t\t\t\t\tbaseURL: (await this.getCredentials('nvidiaNimApi')).baseUrl as string,\n\t\t\t\t\t\2"
content = re.sub(pattern2, replacement2, content)

# Fix for embeddings
pattern3 = r"(// Make API request\s+responseData = await this\.helpers\.requestWithAuthentication\.call\(\s+this,\s+'nvidiaNimApi',\s+\{\s+method: 'POST',)\s+(url: '/embeddings',)"
replacement3 = r"\1\n\t\t\t\t\tbaseURL: (await this.getCredentials('nvidiaNimApi')).baseUrl as string,\n\t\t\t\t\t\2"
content = re.sub(pattern3, replacement3, content)

# Fix for list models
pattern4 = r"(// Make API request\s+responseData = await this\.helpers\.requestWithAuthentication\.call\(\s+this,\s+'nvidiaNimApi',\s+\{\s+method: 'GET',)\s+(url: '/models',)"
replacement4 = r"\1\n\t\t\t\t\tbaseURL: (await this.getCredentials('nvidiaNimApi')).baseUrl as string,\n\t\t\t\t\t\2"
content = re.sub(pattern4, replacement4, content)

# Write the fixed content back
with open('nodes/NvidiaNim/NvidiaNim.node.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed API URL issues successfully!")
