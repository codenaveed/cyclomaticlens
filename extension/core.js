/**
 * Core Cyclomatic Complexity Analyzer - Language-agnostic CCM computation
 * This module contains pure parsing and complexity calculation logic
 * with no VS Code dependencies.
 */

function preprocessC(code) {
    const lines = code.split('\n');
    const result = [];
    
    let i = 0;
    while (i < lines.length) {
        const line = lines[i].trim();
        
        // Check for preprocessor directives
        if (line.startsWith('#if') || line.startsWith('#ifdef') || line.startsWith('#ifndef')) {
            // This is the start of a preprocessor block
            // We need to parse the entire block to determine if it's a chain or independent
            
            let isChain = false;
            let j = i + 1;
            let foundElif = false;
            let foundElse = false;
            let foundEndif = false;
            let isIfZero = (line.startsWith('#if 0') || line.startsWith('#if 0 '));
            
            // Scan forward to find the end of this preprocessor block
            while (j < lines.length && !foundEndif) {
                const nextLine = lines[j].trim();
                if (nextLine.startsWith('#elif')) {
                    foundElif = true;
                } else if (nextLine.startsWith('#else')) {
                    foundElse = true;
                } else if (nextLine.startsWith('#endif')) {
                    foundEndif = true;
                }
                j++;
            }
            
            // Determine if this is a chain or independent block
            // A chain has #elif or #else (or both)
            // An independent block is just #if/#ifdef/#ifndef ... #endif with no #elif or #else
            isChain = foundElif || foundElse;
            
                if (isChain) {
                    // For chains: add a marker that will be counted as +1
                    result.push('__PP_CHAIN__');
                } else if (!isIfZero) {
                    // For independent blocks: add a marker for each independent block
                    // But wait: #ifdef and #ifndef should be counted as +1 each when independent
                    // #if should also be counted as +1 when independent
                    result.push('__PP_INDEPENDENT__');
                }
            
            // Skip the entire preprocessor block
            i = j; // j is already pointing to the line after #endif
            continue;
        }
        
        // Not a preprocessor directive, keep the line as is
        result.push(lines[i]);
        i++;
    }
    
    return result.join('\n');
}

function parseFunctionsGeneric(sourceCode, matchFunctionStart, language) {
    const functions = [];
    const cleanedLines = removeComments(sourceCode).split('\n');

    let i = 0;
    while (i < cleanedLines.length) {
        const funcMatch = matchFunctionStart(cleanedLines[i]);
        if (funcMatch) {
            let funcBody = language === 'python'
                ? extractPythonFunctionBody(cleanedLines, i)
                : extractFunctionBody(cleanedLines, i);

            if (funcBody) {
                functions.push({
                    name: funcMatch.name,
                    startLine: i,
                    body: funcBody.body,
                    endLine: funcBody.endLine
                });
                i = funcBody.endLine + 1;
                continue;
            }
        }
        i++;
    }

    return functions;
}

function parseCFunctions(sourceCode) {
    return parseFunctionsGeneric(sourceCode, matchCFunctionStart, 'c');
}

/**
 * Parse Java methods from source code
 * @param {string} sourceCode - The source code to parse
 * @returns {Array} Array of function objects with name, startLine, body, endLine
 */
function parseJavaFunctions(sourceCode) {
    return parseFunctionsGeneric(sourceCode, matchJavaMethodStart, 'java');
}

/**
 * Parse JavaScript/TypeScript functions from source code
 * @param {string} sourceCode - The source code to parse
 * @returns {Array} Array of function objects with name, startLine, body, endLine
 */
function parseJavaScriptFunctions(sourceCode) {
    return parseFunctionsGeneric(sourceCode, matchJavaScriptFunctionStart, 'javascript');
}

/**
 * Parse Python functions from source code
 * @param {string} sourceCode - The source code to parse
 * @returns {Array} Array of function objects with name, startLine, body, endLine
 */
function parsePythonFunctions(sourceCode) {
    return parseFunctionsGeneric(sourceCode, matchPythonFunctionStart, 'python');
}

function matchCFunctionStart(line) {
    // Match C function definitions like: int main(), void foo(int x), etc.
    // Skip control structures and other non-function patterns
    const trimmed = line.trim();
    
    // Skip common non-function patterns
    if (/^\s*(if|else|while|for|switch|return|typedef|struct|union|enum|#)/.test(trimmed)) {
        return null;
    }
    
    // Match: type [modifiers] function_name(params) {
    // Allow comments at the end of the line
    const funcPattern = /^[\w\s*]+\s+(\*?\w+)\s*\([^)]*\)\s*\{?\s*(?:\/\/.*)?$/;
    const match = trimmed.match(funcPattern);
    
    if (match && match[1]) {
        // Additional check: function name shouldn't be a keyword
        const keywords = ['if', 'else', 'while', 'for', 'switch', 'return', 'sizeof', 'typedef'];
        if (!keywords.includes(match[1])) {
            return { name: match[1] };
        }
    }
    
    return null;
}

function matchJavaMethodStart(line) {
    // Match Java method definitions
    const trimmed = line.trim();
    
    // Skip common non-method patterns
    if (/^\s*(if|else|while|for|switch|return|class|interface|enum|import|package|@)/.test(trimmed)) {
        return null;
    }
    
    // Skip field declarations with lambda assignments
    if (/^\s*(?:private|public|protected)?\s*\w+<[^>]*>\s+\w+\s*=/.test(trimmed)) {
        return null;
    }

    const methodPattern =
    "^" + // start of line
    "(?:public|private|protected|static|final|abstract|synchronized|native|\\s)*" + // modifiers OR whitespace (repeated)
    "\\s*" + // optional whitespace
    "(?:<[^>]+>\\s*)?" + // optional generics (e.g. <T>)
    "[\\w<>\\[\\]]+" + // return type (e.g. int, List<T>, byte[])
    "\\s+" + // space before method name
    "(\\w+)" + // method name (captured)
    "\\s*" + // optional whitespace
    "\\([^)]*\\)" + // parameter list
    "(?:\\s*throws\\s+[\\w,\\s]+)?" + // optional throws clause
    "\\s*" + // optional whitespace
    "\\{?" + // optional opening brace
    "\\s*" + // optional whitespace
    "(?:\\/\\/.*)?" + // optional single-line comment
    "$"; // end of line    
    const match = trimmed.match(methodPattern);
    
    if (match && match[1]) {
        // Additional check: method name shouldn't be a keyword
        const keywords = ['if', 'else', 'while', 'for', 'switch', 'return', 'class', 'interface', 'new'];
        if (!keywords.includes(match[1])) {
            return { name: match[1] };
        }
    }
    
    return null;
}

function matchJavaScriptFunctionStart(line) {
    const trimmed = line.trim();

    // Skip obvious non-function control structures
    if (/^\s*(if|else|while|for|switch|return|class|interface|enum|import)\b/.test(trimmed)) {
        return null;
    }

    const funcPattern = /function\s+([a-zA-Z_$][\w$]*)/;

    const match = trimmed.match(funcPattern);

    if (match) {
        return { name: match[1] };
    }

    return null;
}

function matchPythonFunctionStart(line) {
    // Match Python function definitions
    const trimmed = line.trim();
    
    // Check if it's a function definition
    // Allow comments at the end of the line (Python uses # for comments)
    const funcPattern = /^\s*def\s+(\w+)\s*\([^)]*\)\s*:(?:\s*#.*)?$/;
    const match = trimmed.match(funcPattern);
    
    if (match && match[1]) {
        // Additional check: function name shouldn't be a keyword
        const keywords = ['if', 'else', 'while', 'for', 'try', 'except', 'class', 'import', 'from'];
        if (!keywords.includes(match[1])) {
            return { name: match[1] };
        }
    }
    
    return null;
}

function extractPythonFunctionBody(lines, startLine) {
    // Python uses indentation, not braces
    // Find the indentation level of the function definition
    const defLine = lines[startLine];
    const indentMatch = defLine.match(/^(\s*)/);
    const defIndent = indentMatch ? indentMatch[1].length : 0;
    
    let bodyLines = [defLine];
    
    for (let i = startLine + 1; i < lines.length; i++) {
        const line = lines[i];
        const lineIndentMatch = line.match(/^(\s*)/);
        const lineIndent = lineIndentMatch ? lineIndentMatch[1].length : 0;
        
        // If line is empty or comment, include it
        if (line.trim() === '' || line.trim().startsWith('#')) {
            bodyLines.push(line);
            continue;
        }
        
        // If line has less or equal indentation than function definition, we're done
        if (lineIndent <= defIndent) {
            return {
                body: bodyLines.join('\n'),
                endLine: i - 1
            };
        }
        
        bodyLines.push(line);
    }
    
    // If we reach the end of file
    return {
        body: bodyLines.join('\n'),
        endLine: lines.length - 1
    };
}

function extractFunctionBody(lines, startLine) {
    let braceCount = 0;
    let foundOpen = false;
    let bodyLines = [];
    
    for (let i = startLine; i < lines.length; i++) {
        const line = lines[i];
        bodyLines.push(line);
        
        for (const char of line) {
            if (char === '{') {
                braceCount++;
                foundOpen = true;
            } else if (char === '}') {
                braceCount--;
            }
        }
        
        if (foundOpen && braceCount === 0) {
            return {
                body: bodyLines.join('\n'),
                endLine: i
            };
        }
    }
    
    return null;
}

function removeComments(code) {
    // Preserve line count by replacing block comment content with newlines
    code = code.replace(/\/\*[\s\S]*?\*\//g, match => {
        const lineCount = (match.match(/\n/g) || []).length;
        return '\n'.repeat(lineCount);
    });
    // Remove line comments (single line, safe)
    code = code.replace(/\/\/.*$/gm, '');
    return code;
}

/**
 * Map a numeric CCM score to a human-readable level label
 * @param {number} score - The cyclomatic complexity score
 * @returns {string} Level label: Low, Medium, High, Very High, Critical
 */
function getLevel(score) {
    if (score <= 10) return 'Low';
    if (score <= 20) return 'Medium';
    if (score <= 30) return 'High';
    if (score <= 50) return 'Very High';
    return 'Critical';
}

/**
 * Calculate cyclomatic complexity of a function body
 * @param {string} functionBody - The function body code
 * @param {string} language - The programming language ('c', 'java', 'javascript', 'typescript', 'python')
 * @returns {number} The cyclomatic complexity score
 */
function calculateComplexity(functionBody, language) {
    // Base complexity
    let complexity = 1;
    let processedBody = functionBody;
    
    if (language === 'c') {
        processedBody = preprocessC(functionBody);
    }
    // Clean the body
    const cleanBody = removeComments(processedBody);  
    
    // Language-specific control flow patterns
    // Aligned with Python parser implementations
    // Based on McCabe's Cyclomatic Complexity rules:
    // - 'if' adds 1 (including 'else if' - the 'if' is matched)
    // - 'else' alone does NOT add complexity (it's part of the if branch)
    // - 'for' and 'while' loops add 1 each
    // - 'case' adds 1 each (but NOT 'default' - it's the fallback path)
    // - 'catch' adds 1 (exception handling branch for Java)
    // - 'except' adds 1 for Python (exception handling)
    // Note: Python parsers don't count '?', '&&', '||' explicitly
    
    let patterns = [];
    
    if (language === 'java') {
        // Java-specific patterns
        patterns = [
            /\bif\b/g,           // if statements (including else if)
            /\bfor\b/g,          // for loops
            /\bwhile\b/g,        // while loops
            /\bcase\b/g,         // case labels
            /\bcatch\b/g,        // catch clauses
            /\?/g,               // ternary operator
            /&&/g,               // and
            /\|\|/g              // or
        ];
    } else if (language === 'javascript' || language === 'typescript') {
        // JavaScript/TypeScript patterns
        patterns = [
            /\bif\b/g,           // if statements (including else if)
            /\bfor\b/g,          // for loops
            /\bwhile\b/g,        // while loops
            /\bcase\b/g,         // case labels
            /\bcatch\b/g,        // catch clauses
            /\?/g,               // ternary operator
            /&&/g,               // and
            /\|\|/g              // or            
        ];
    } else if (language === 'c') {
        // C/C++ patterns - note: logical operators (&&, ||) are NOT counted
        // based on the comment in example.cpp: (tool ignores &&)
        patterns = [
            /\bif\b/g,           // if statements (including else if)
            /\bfor\b/g,          // for loops
            /\bwhile\b/g,        // while loops
            /\bcase\b/g,         // case labels
            /\?/g,                // ternary operator  
            /&&/g,               // and
            /\|\|/g,             // or
            /__PP_CHAIN__/g,     // preprocessor chains (count as +1)
            /__PP_INDEPENDENT__/g // independent preprocessor blocks (count as +1 each)
        ];
        // Note: C doesn't have 'catch' like Java
    } else if (language === 'python') {
        // Python patterns - note: logical operators (and, or) are NOT counted
        // to match the expected values from the test suite
        // Remove Python comments first
        let pythonBody = cleanBody.replace(/#.*$/gm, '');
        patterns = [
            /\bif\b/g,           // if statements
            /\belif\b/g,         // elif (counts as another if)
            /\bfor\b/g,          // for loops
            /\bwhile\b/g,        // while loops
            /\bexcept\b/g,       // except clauses
            /\band\b/g,           // and clauses
            /\bor\b/g             // or clauses
        ];
        
        // Use pythonBody for Python patterns
        patterns.forEach(pattern => {
            const matches = pythonBody.match(pattern);
            if (matches) {
                complexity += matches.length;
            }
        });
        return complexity;
    }
    
    patterns.forEach(pattern => {
        const matches = cleanBody.match(pattern);
        if (matches) {
            complexity += matches.length;
        }
    });
    
    return complexity;
}

module.exports = {
    parseCFunctions,
    parseJavaFunctions,
    parseJavaScriptFunctions,
    parsePythonFunctions,
    calculateComplexity,
    getLevel
};
