// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

function getDirectoryTree(dirPath: string, prefix = ''): string {
	const entries = fs.readdirSync(dirPath, { withFileTypes: true });
	let result = '';
  
	for (const entry of entries) {
	  const entryPath = path.join(dirPath, entry.name);
	  result += `${prefix}${entry.name}\n`;
  
	  if (entry.isDirectory()) {
		result += getDirectoryTree(entryPath, prefix + '  ');
	  }
	}
  
	return result;
  }

export function activate(context: vscode.ExtensionContext) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "vibe-editor" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('vibe-editor.helloWorld', () => {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World!');
	});

	context.subscriptions.push(disposable);

	const copyCode = vscode.commands.registerCommand('vibe-editor.copyCode', async () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {return;}
	
		const selection = editor.selection;
		const text = editor.document.getText(selection);
	
		if (text.trim()) {
		  await vscode.env.clipboard.writeText(text);
		  vscode.window.showInformationMessage('✅ 코드가 클립보드에 복사되었습니다!');
		} else {
		  vscode.window.showWarningMessage('⚠️ 복사할 코드가 없습니다.');
		}
	  });
	
	context.subscriptions.push(copyCode);

	const showTextDocument = vscode.commands.registerCommand('vibe-editor.exportDirectoryTree', async (uri: vscode.Uri) => {
		if (!uri || !uri.fsPath) {
		  vscode.window.showWarningMessage('폴더를 선택하세요.');
		  return;
		}
	
		const treeText = getDirectoryTree(uri.fsPath);
		const doc = await vscode.workspace.openTextDocument({
		  content: treeText,
		  language: 'plaintext'
		});
	
		await vscode.window.showTextDocument(doc);
	  });
	
	context.subscriptions.push(showTextDocument);
}