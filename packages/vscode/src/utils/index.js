// 导出 vscode 实例
export const vscode = acquireVsCodeApi();

// 资源应用
export const utilGetAssets = (name) => {
    return new URL(`../assets/${name}`, import.meta.url).href;
};

// 传递消息
export const utilPostMessage = (method, data = {}) => {
    vscode.postMessage({ method, data });
};
