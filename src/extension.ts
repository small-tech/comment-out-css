// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "comment-out-css" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand('comment-out-css', () => {
    // The code you place here will be executed every time your command is executed

    const editor = vscode.window.activeTextEditor;

    if (editor) {
      const document = editor.document;
      const selection = editor.selection;

      // Get the word within the selection
      const selectionText = document.getText(selection);


      const kCommentedOutCSSStartMarker = '/*⛔';
      const kCommentedOutCSSEndMarker = '🔚*/';
      const kInnerCommentStartMarker = '➡';
      const kInnerCommentEndMarker = '⬅';

      const kAllCommentStartMarkersRegExp            = /\/\*/g
      const kAllCommentEndMarkersRegExp           = /\*\//g
      const kAllCommentedOutCSSStartMarkersRegExp = /\/\*⛔/g;
      const kAllCommentedOutCSSEndMarkersRegExp   = /🔚\*\//g;
      const kAllInnerCommentStartMarkersRegExp    = new RegExp(kInnerCommentStartMarker, 'g');
      const kAllInnerCommentEndMarkersRegExp      = new RegExp(kInnerCommentEndMarker, 'g');


      // First, count the number of comment start and end markers in the selection. If the number of start and end
      // markers do not match, do nothing (we don’t handle partial comments at the moment as that’s far more
      // complicated.)
      const numberOfRegularCSSCommentsStarted    = countMatches(selectionText.match(kAllCommentStartMarkersRegExp));
      const numberOfRegularCSSCommentsEnded      = countMatches(selectionText.match(kAllCommentEndMarkersRegExp));
      const numberOfCommentedOutCSSBlocksStarted = countMatches(selectionText.match(kAllCommentedOutCSSStartMarkersRegExp));
      const numberOfCommentedOutCSSBlocksEnded   = countMatches(selectionText.match(kAllCommentedOutCSSEndMarkersRegExp));
      const numberOfInnerCommentsStarted         = countMatches(selectionText.match(kAllInnerCommentStartMarkersRegExp));
      const numberOfInnerCommentsEnded           = countMatches(selectionText.match(kAllInnerCommentEndMarkersRegExp));

      console.log(`
      Number of regular CSS comments started     : ${numberOfRegularCSSCommentsStarted}
      Number of regular CSS comments ended       : ${numberOfRegularCSSCommentsEnded}
      Number of commented-out CSS blocks started : ${numberOfCommentedOutCSSBlocksStarted}
      Number of commented-out CSS blocks ended   : ${numberOfCommentedOutCSSBlocksEnded}
      Number of inner comments started           : ${numberOfInnerCommentsStarted}
      Number of inner comments ended             : ${numberOfInnerCommentsEnded}
      `)

      let okToContinue =
        // We do not support breaking up of existing comments.
        numberOfRegularCSSCommentsStarted === numberOfRegularCSSCommentsEnded

        // We do not support partial uncommenting of comment blocks.
        && numberOfCommentedOutCSSBlocksStarted === numberOfCommentedOutCSSBlocksEnded

        // We do not support toggling the status of multiple comment blocks.
        && numberOfCommentedOutCSSBlocksStarted <= 1

        // We do not support partial uncommenting of comment blocks with inner comments.
        && numberOfInnerCommentsStarted === numberOfInnerCommentsEnded

        // If there are inner comments, ensure that our delimiters are also selected.
        && (numberOfInnerCommentsStarted > 0 ? numberOfCommentedOutCSSBlocksStarted === 1 : true)

      if (!okToContinue) { return; }

      let result: string;
      if (numberOfCommentedOutCSSBlocksStarted === 1) {
        // Uncomment
        result = selectionText
        result = result.replace(kAllCommentedOutCSSStartMarkersRegExp, '')
        result = result.replace(kAllCommentedOutCSSEndMarkersRegExp, '')
        result = result.replace(kAllInnerCommentStartMarkersRegExp, '/*')
        result = result.replace(kAllInnerCommentEndMarkersRegExp, '*/')
      } else {
        // Comment
        result = selectionText

        if (numberOfRegularCSSCommentsStarted === 0) {
          // Do a regular commenting out.
          vscode.commands.executeCommand('editor.action.commentLine')
          return
        } else {
          result = result.replace(/\/\*/g, kInnerCommentStartMarker)
          result = result.replace(/\*\//g, kInnerCommentEndMarker)
          result = `${kCommentedOutCSSStartMarker}${result}${kCommentedOutCSSEndMarker}`
        }
      }

      editor.edit(editBuilder => {
      	editBuilder.replace(selection, result);
      });
    }
  });

  context.subscriptions.push(disposable);
}

function countMatches(regExpMatchResult: RegExpMatchArray | null): number {
  return regExpMatchResult === null ? 0 : regExpMatchResult.length;
}

// this method is called when your extension is deactivated
export function deactivate() {}
