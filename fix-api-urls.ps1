# PowerShell script to fix API URL issues in NvidiaNim.node.ts

$filePath = "nodes\NvidiaNim\NvidiaNim.node.ts"
$content = Get-Content $filePath -Raw

# Pattern to find: requestWithAuthentication calls
# We need to add baseURL parameter before url parameter

# Replace pattern for chat completions
$content = $content -replace `
    '(// Make API request\s+responseData = await this\.helpers\.requestWithAuthentication\.call\(\s+this,\s+''nvidiaNimApi'',\s+\{[\s\S]*?method: ''POST'',)\s+(url: ''/chat/completions'',)', `
    "`$1`n`t`t`t`t`tbaseURL: (await this.getCredentials('nvidiaNimApi')).baseUrl as string,`n`t`t`t`t`t`$2"

# Replace pattern for completions
$content = $content -replace `
    '(// Make API request\s+responseData = await this\.helpers\.requestWithAuthentication\.call\(\s+this,\s+''nvidiaNimApi'',\s+\{[\s\S]*?method: ''POST'',)\s+(url: ''/completions'',)', `
    "`$1`n`t`t`t`t`tbaseURL: (await this.getCredentials('nvidiaNimApi')).baseUrl as string,`n`t`t`t`t`t`$2"

# Replace pattern for embeddings
$content = $content -replace `
    '(// Make API request\s+responseData = await this\.helpers\.requestWithAuthentication\.call\(\s+this,\s+''nvidiaNimApi'',\s+\{[\s\S]*?method: ''POST'',)\s+(url: ''/embeddings'',)', `
    "`$1`n`t`t`t`t`tbaseURL: (await this.getCredentials('nvidiaNimApi')).baseUrl as string,`n`t`t`t`t`t`$2"

# Replace pattern for list models (GET request)
$content = $content -replace `
    '(// Make API request\s+responseData = await this\.helpers\.requestWithAuthentication\.call\(\s+this,\s+''nvidiaNimApi'',\s+\{[\s\S]*?method: ''GET'',)\s+(url: ''/models'',)', `
    "`$1`n`t`t`t`t`tbaseURL: (await this.getCredentials('nvidiaNimApi')).baseUrl as string,`n`t`t`t`t`t`$2"

# Write back to file
Set-Content $filePath -Value $content -NoNewline

Write-Host "Fixed API URL issues in $filePath"
