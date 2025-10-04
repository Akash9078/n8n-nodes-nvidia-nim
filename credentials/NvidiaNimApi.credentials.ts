import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class NvidiaNimApi implements ICredentialType {
	name = 'nvidiaNimApi';
	displayName = 'NVIDIA NIM API';
	documentationUrl = 'https://docs.nvidia.com/nim/';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'Your NVIDIA NGC API Key. Generate one at <a href="https://ngc.nvidia.com" target="_blank">ngc.nvidia.com</a>',
		},
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://integrate.api.nvidia.com/v1',
			description: 'The base URL for NVIDIA NIM API endpoints. Leave default for NVIDIA-hosted endpoints.',
			required: true,
			placeholder: 'https://integrate.api.nvidia.com/v1',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl}}',
			url: '/models',
			method: 'GET',
		},
	};
}
