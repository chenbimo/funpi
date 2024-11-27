import { defineExtension, useCommand, useIsDarkTheme, watchEffect } from 'reactive-vscode';
import { window } from 'vscode';
import { message } from './configs';
import { logger } from './utils';

export default defineExtension(() => {
    logger.info('Extension Activated');

    useCommand('your-extension.helloWorld', () => {
        window.showInformationMessage(message.value);
    });

    const isDark = useIsDarkTheme();
    watchEffect(() => {
        logger.info('Is Dark Theme:', isDark.value);
    });
});
