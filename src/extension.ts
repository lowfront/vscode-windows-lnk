import * as vscode from 'vscode';
import ws from './ws';

// const r = ws.query('d:\\DEV\\YO\\helloworld\\[HASHSNAP]뽀로로파크_금천점 시간대별 진행컨텐츠계획서_2020.12.14_양다윗.xlsx - 바로 가기.lnk');
// r.then(console.log).catch(console.log)

class LnkDocument implements vscode.CustomDocument{
	dispose(): void {
		return;
	}

	public readonly uri: vscode.Uri;
	private constructor(
		uri: vscode.Uri,
		initialContent: Uint8Array,
	) {
		this.uri = uri;
	}
	static async create(
		uri: vscode.Uri,
		backupId: string | undefined
	) {
		const dataFile = typeof backupId === 'string' ? vscode.Uri.parse(backupId) : uri;
		const fileData = await LnkDocument.readFile(dataFile);
		return new LnkDocument(uri, fileData);
	}
	private static async readFile(uri: vscode.Uri): Promise<Uint8Array> {
		if (uri.scheme === 'untitled') {
			return new Uint8Array();
		}
		return vscode.workspace.fs.readFile(uri);
	}
}

let uiqOpenId = 0;
class LnkProvider implements vscode.CustomReadonlyEditorProvider<LnkDocument> {
	public static register(context: vscode.ExtensionContext): vscode.Disposable {
		return vscode.window.registerCustomEditorProvider(
			LnkProvider.viewType,
			new LnkProvider(context),
			{supportsMultipleEditorsPerDocument: false,}
		)
	}
	public static readonly viewType = 'ink.connector';
	constructor(private readonly _context: vscode.ExtensionContext) { }

	async openCustomDocument(
		uri: vscode.Uri,
		openContext: {backupId?: string},
		_token: vscode.CancellationToken
	): Promise<LnkDocument> {
		
		const document: LnkDocument = await LnkDocument.create(uri, openContext.backupId);
		try {
			const {target} = await ws.query(uri.fsPath);
			const textDocument = await vscode.workspace.openTextDocument(target)
			vscode.window.showTextDocument(textDocument, 1, false);
			return document;
		} catch(err) {
			vscode.window.showErrorMessage('Cannot open binary file. (Windows lnk)');
			console.error(err);
			return document;
		}

	}
	resolveCustomEditor(
		document: LnkDocument,
		webviewPanel: vscode.WebviewPanel,
		token: vscode.CancellationToken
	): void | Thenable<void> {
		webviewPanel.dispose();
		webviewPanel.webview.options = {enableScripts: false};
		webviewPanel.webview.html = '';
		webviewPanel.webview.onDidReceiveMessage(console.log);
	}

}

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(LnkProvider.register(context));
}

// this method is called when your extension is deactivated
export function deactivate() {}
