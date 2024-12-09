// 核心模块
import { join } from 'node:path';
import { TextDecoder } from 'node:util';

// 内部模块
import * as vscode from 'vscode';

// 全局上下文
let globalContext = {};
let globalWebview = {};
let funPiWebViewInstance = {};
let funPiWebViewProvider = {};
// 全局数据
const globalData = {
    configuration: {}
};
const utf8TextDecoder = new TextDecoder('utf8');

// 传递信息
const postMessage = (method, data) => {
    globalWebview.postMessage({ method, data });
};

class FunPiWebViewProvider {
    constructor() {}

    async resolveWebviewView(panel, context, token) {
        // 注册 webview
        panel.onDidDispose(() => {
            console.log('Webview was disposed');
        });
        panel.webview.options = {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.file(join(globalContext.extensionPath, 'dist'))],
            retainContextWhenHidden: true
        };

        // 插件接收消息
        panel.webview.onDidReceiveMessage((event) => {
            onDidReceiveMessage(event);
        });

        // 监听插件隐藏
        // panel.onDidChangeVisibility(() => {
        //     if (!panel.visible) {
        //         console.log('webview隐藏了');
        //         panel.webview.postMessage('webviewHidden', {});
        //     }
        // });

        const indexPath = vscode.Uri.joinPath(globalContext.extensionUri, 'dist', 'index.html');
        const indexBytes = await vscode.workspace.fs.readFile(indexPath);
        const indexData = utf8TextDecoder.decode(indexBytes);
        const indexHtml = indexData.replace(/(src|href)="(.+?)"/gi, (match, p1, p2) => {
            const _path = vscode.Uri.joinPath(globalContext.extensionUri, 'dist', p2);
            const _uri = panel.webview.asWebviewUri(_path);
            return `${p1}=${_uri}`;
        });

        panel.webview.html = indexHtml;
        globalWebview = panel.webview;

        // 激活扩展
        postMessage('activeExtend', {});
    }
}

// 监听消息
const onDidReceiveMessage = async (event) => {
    const { method, data = {} } = event;
};

// 功能函数区域 ----------------------------------------------------------------------

export async function activate(context) {
    globalContext = context;
    // 获取全局配置
    globalData.configuration = await vscode.workspace.getConfiguration('funPi');
    // 注册用户中心视图
    funPiWebViewInstance = new FunPiWebViewProvider();
    funPiWebViewProvider = await vscode.window.registerWebviewViewProvider('funPiWebView', funPiWebViewInstance);
}

export async function deactivate() {
    postMessage('deactivate', {});
}
