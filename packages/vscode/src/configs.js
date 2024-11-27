import { defineConfigs } from 'reactive-vscode';

export const { message } = defineConfigs('your-extension', {
    message: 'string'
});
