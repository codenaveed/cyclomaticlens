const vscode = require('vscode');
const coreAnalyzer = require('./core.js');

/**
 * Cyclomatic Complexity Analyzer - Simple & Clean
 * Shows inline CCM scores at the top of each function
 * Supports C, C++, Java, JavaScript, TypeScript, and Python
 */

// Decoration type for inline CCM annotations
let ccmDecorationType;

function activate(context) {
    // Create decoration type for inline annotations
    ccmDecorationType = vscode.window.createTextEditorDecorationType({
        after: {
            margin: '0 0 0 1em',
            textDecoration: 'none'
        }
    });
    context.subscriptions.push(ccmDecorationType);

    // Analyze when a supported file is opened
    vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor && isSupportedFile(editor.document)) {
            analyzeAndDecorate(editor);
        }
    }, null, context.subscriptions);

    // Analyze when document is saved
    vscode.workspace.onDidSaveTextDocument(document => {
        const editor = vscode.window.activeTextEditor;
        if (editor && editor.document === document && isSupportedFile(document)) {
            analyzeAndDecorate(editor);
        }
    }, null, context.subscriptions);

    // Analyze when document content changes (with debounce)
    let timeout;
    vscode.workspace.onDidChangeTextDocument(event => {
        const editor = vscode.window.activeTextEditor;
        if (editor && editor.document === event.document && isSupportedFile(event.document)) {
            clearTimeout(timeout);
            timeout = setTimeout(() => analyzeAndDecorate(editor), 500);
        }
    }, null, context.subscriptions);

    // Analyze current file if already open
    if (vscode.window.activeTextEditor && isSupportedFile(vscode.window.activeTextEditor.document)) {
        analyzeAndDecorate(vscode.window.activeTextEditor);
    }
}

function isSupportedFile(document) {
    let language = getLanguage(document);
    return (language==='c' || language==='java' || language==='javascript' || 
            language==='typescript' || language==='python');
}

function getLanguage(document) {
    if((document.languageId === 'c') || document.languageId === 'cpp' ||
        document.fileName.endsWith('.c') || document.fileName.endsWith('.h') ||
        document.fileName.endsWith('.cpp') || document.fileName.endsWith('.cc') ||
        document.fileName.endsWith('.cxx') || document.fileName.endsWith('.hpp')) {
        return 'c';
    } else if (document.languageId === 'java' || document.fileName.endsWith('.java')) {
        return 'java';
    } else if (document.languageId === 'javascript' || document.fileName.endsWith('.js')) {
        return 'javascript';
    } else if (document.languageId === 'typescript' || document.languageId === 'typescriptreact' ||
               document.fileName.endsWith('.ts') || document.fileName.endsWith('.tsx')) {
        return 'typescript';
    } else if (document.languageId === 'python' || document.fileName.endsWith('.py')) {
        return 'python';
    }
}

function analyzeAndDecorate(editor) {
    const document = editor.document;
    const sourceCode = document.getText();
    
    let functions;
    if(!isSupportedFile(document)){
        return null;
    }
    const language = getLanguage(document);
    switch(language) {
        case 'java':
            functions = coreAnalyzer.parseJavaFunctions(sourceCode);
            break;
        case 'javascript':
        case 'typescript':
            functions = coreAnalyzer.parseJavaScriptFunctions(sourceCode);
            break;
        case 'c':
            functions = coreAnalyzer.parseCFunctions(sourceCode);
            break;
        case 'python':
            functions = coreAnalyzer.parsePythonFunctions(sourceCode);
            break;
    }
    
    const decorations = [];
    
    if (functions) {
        functions.forEach(func => {
            const complexity = coreAnalyzer.calculateComplexity(func.body, language);
            const { emoji, label, color } = getComplexityStyle(complexity);
            
            // Get the function definition line
            const line = document.lineAt(func.startLine);
            const annotationLine = func.startLine;
            const annotationPosition = line.text.length;
            const range = new vscode.Range(
                annotationLine, annotationPosition,
                annotationLine, annotationPosition
            );
            
            decorations.push({
                range: range,
                renderOptions: {
                    after: {
                        contentText: ` ${emoji} CCM: ${complexity}(${label})`,
                        color: color
                    }
                }
            });
        });
    }
    
    editor.setDecorations(ccmDecorationType, decorations);
}

function getComplexityStyle(complexity) {
    if (complexity <= 10) {
        return { emoji: "😀", label: 'Low', color: '#4EC9B0' };  // Green
    } else if (complexity <= 20) {
        return { emoji: "☺️", label: 'Medium', color: '#dce400' };  // Yellow
    } else if (complexity <= 30) {
        return { emoji: "😞", label: 'High', color: '#F44747' };  // Red
    } else if (complexity <= 50) {
        return { emoji: "😡", label: 'Very High', color: '#F44747' };  // Red
    } else {
        return { emoji: "👿", label: 'Critical', color: '#F44747' };  // Red
    }
}

function deactivate() {
    if (ccmDecorationType) {
        ccmDecorationType.dispose();
    }
}

module.exports = {
    activate,
    deactivate,
    calculateComplexity: coreAnalyzer.calculateComplexity,
    parseCFunctions: coreAnalyzer.parseCFunctions,
    parseJavaFunctions: coreAnalyzer.parseJavaFunctions,
    parseJavaScriptFunctions: coreAnalyzer.parseJavaScriptFunctions,
    parsePythonFunctions: coreAnalyzer.parsePythonFunctions
};

