#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const core = require('./core.js');

const SUPPORTED_EXTENSIONS = {
    '.c': 'c',
    '.cpp': 'c',
    '.h': 'c',
    '.hpp': 'c',
    '.cc': 'c',
    '.cxx': 'c',
    '.java': 'java',
    '.js': 'javascript',
    '.ts': 'typescript',
    '.tsx': 'typescript',
    '.py': 'python'
};

const LANGUAGE_PARSER_MAP = {
    'c': core.parseCFunctions,
    'java': core.parseJavaFunctions,
    'javascript': core.parseJavaScriptFunctions,
    'typescript': core.parseJavaScriptFunctions,
    'python': core.parsePythonFunctions
};

function isBinaryOrGenerated(name) {
    const skip = /^(node_modules|\.git|\.svn|__pycache__|\.venv|venv|\.eggs|dist|build|\.next|target)$/;
    return skip.test(name);
}

function walkDirectory(dirPath) {
    const files = [];
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
        if (isBinaryOrGenerated(entry.name)) continue;
        const fullPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
            files.push(...walkDirectory(fullPath));
        } else if (entry.isFile()) {
            const ext = path.extname(entry.name).toLowerCase();
            if (SUPPORTED_EXTENSIONS[ext]) {
                files.push({ filePath: fullPath, language: SUPPORTED_EXTENSIONS[ext] });
            }
        }
    }
    return files;
}

function analyzeFile(fileInfo) {
    const sourceCode = fs.readFileSync(fileInfo.filePath, 'utf8');
    const parseFn = LANGUAGE_PARSER_MAP[fileInfo.language];
    const functions = parseFn(sourceCode);
    const results = [];
    for (const func of functions) {
        const ccm = core.calculateComplexity(func.body, fileInfo.language);
        const level = core.getLevel(ccm);
        results.push({
            path: path.dirname(fileInfo.filePath),
            file: path.basename(fileInfo.filePath),
            language: fileInfo.language,
            function: func.name,
            ccm: ccm,
            level: level
        });
    }
    return results;
}

function escapeCsv(val) {
    const s = String(val);
    if (/[,"\n]/.test(s)) {
        return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
}

function toCsv(results) {
    const header = 'Path,File,Function,CCM,Complexity';
    const rows = results.map(r =>
        [r.path, r.file, r.function, r.ccm, r.level].map(escapeCsv).join(',')
    );
    return [header, ...rows].join('\n');
}

// ── Docstring helpers ──────────────────────────────────────────────────────────

function findDocstringRange(lines, funcStartLine) {
    let i = funcStartLine - 1;
    while (i >= 0) {
        const trimmed = lines[i].trim();
        if (trimmed === '' || trimmed === '{' || trimmed.startsWith('@')) {
            i--;
            continue;
        }
        if (trimmed.startsWith('/**') && trimmed.endsWith('*/')) {
            return { startLine: i, endLine: i };
        }
        if (trimmed.endsWith('*/')) {
            const endLine = i;
            i--;
            while (i >= 0) {
                if (lines[i].trim().startsWith('/**')) {
                    return { startLine: i, endLine };
                }
                i--;
            }
            return null;
        }
        return null;
    }
    return null;
}

function findPythonDocstringRange(lines, funcStartLine) {
    let i = funcStartLine + 1;
    while (i < lines.length && lines[i].trim() === '') i++;
    if (i >= lines.length) return null;

    const trimmed = lines[i].trim();
    let delim = null;
    if (trimmed.startsWith('"""')) {
        delim = '"""';
    } else if (trimmed.startsWith("'''")) {
        delim = "'''";
    } else {
        return null;
    }

    const openLine = i;
    const afterOpen = trimmed.slice(3);
    if (afterOpen.includes(delim)) {
        return { startLine: openLine, endLine: openLine };
    }

    i++;
    while (i < lines.length) {
        if (lines[i].trim().includes(delim)) {
            return { startLine: openLine, endLine: i };
        }
        i++;
    }
    return null;
}

function getDocstringIndent(lines, startLine) {
    const m = lines[startLine + 1] ? lines[startLine + 1].match(/^(\s*)/) : null;
    if (m && m[1].length > 0) return m[1];
    const m2 = lines[startLine].match(/^(\s*)/);
    return m2 ? m2[1] + ' ' : ' ';
}

// ── Tag manipulation ───────────────────────────────────────────────────────────

function upsertComplexityTagJavaLike(lines, range, level) {
    const { startLine, endLine } = range;
    if (startLine === endLine) return; // skip single-line docstrings

    let existingComplexity = -1;
    let lastTagLine = -1;

    for (let i = startLine + 1; i < endLine; i++) {
        const trimmed = lines[i].trim();
        const tagMatch = trimmed.match(/^\*\s*@(\w+)/);
        if (tagMatch) {
            lastTagLine = i;
            if (tagMatch[1].toLowerCase() === 'complexity') {
                existingComplexity = i;
            }
        }
    }

    if (existingComplexity !== -1) {
        const indent = lines[existingComplexity].match(/^(\s*)/)[0];
        const nameMatch = lines[existingComplexity].trim().match(/^(\*\s*@complexity\s*).*/i);
        const prefix = nameMatch ? nameMatch[1] : '* @complexity ';
        lines[existingComplexity] = `${indent}${prefix}${level}`;
        return;
    }

    const indent = getDocstringIndent(lines, startLine);
    const newLine = `${indent}* @complexity ${level}`;

    if (lastTagLine !== -1) {
        lines.splice(lastTagLine + 1, 0, newLine);
    } else {
        lines.splice(endLine, 0, newLine);
    }
}

function upsertComplexityTagPython(lines, range, level) {
    const { startLine, endLine } = range;
    if (startLine === endLine) return;

    let existingComplexity = -1;

    for (let i = startLine + 1; i < endLine; i++) {
        const trimmed = lines[i].trim();
        if (/^complexity\b/.test(trimmed)) {
            existingComplexity = i;
            break;
        }
    }

    if (existingComplexity !== -1) {
        const indent = lines[existingComplexity].match(/^(\s*)/)[0];
        lines[existingComplexity] = `${indent}complexity ${level}`;
        return;
    }

    const indent = lines[endLine].match(/^(\s*)/)[0];
    const newLine = `${indent}complexity ${level}`;
    lines.splice(endLine, 0, newLine);
}

// ── Docstring creation ───────────────────────────────────────────────────────

function addJavaLikeDocstring(lines, funcStartLine, level) {
    const indent = lines[funcStartLine].match(/^(\s*)/)[0];
    lines.splice(funcStartLine, 0,
        `${indent}/**`,
        `${indent} * @complexity ${level}`,
        `${indent} */`
    );
}

function addPythonDocstring(lines, funcStartLine, level) {
    const defLine = lines[funcStartLine];
    const defIndent = defLine.match(/^(\s*)/)[0];
    const bodyIndent = defIndent + '    ';
    lines.splice(funcStartLine + 1, 0,
        `${bodyIndent}"""complexity ${level}`,
        `${bodyIndent}"""`
    );
}

// ── Edit orchestration ─────────────────────────────────────────────────────────

function editFile(fileInfo) {
    const sourceCode = fs.readFileSync(fileInfo.filePath, 'utf8');
    const lines = sourceCode.split('\n');
    const parseFn = LANGUAGE_PARSER_MAP[fileInfo.language];
    const functions = parseFn(sourceCode);

    for (let idx = functions.length - 1; idx >= 0; idx--) {
        const func = functions[idx];
        const ccm = core.calculateComplexity(func.body, fileInfo.language);
        const level = core.getLevel(ccm);

        if (fileInfo.language === 'python') {
            const range = findPythonDocstringRange(lines, func.startLine);
            if (range) {
                upsertComplexityTagPython(lines, range, level);
            } else {
                addPythonDocstring(lines, func.startLine, level);
            }
        } else {
            const range = findDocstringRange(lines, func.startLine);
            if (range) {
                upsertComplexityTagJavaLike(lines, range, level);
            } else {
                addJavaLikeDocstring(lines, func.startLine, level);
            }
        }
    }

    const modified = lines.join('\n');
    if (modified !== sourceCode) {
        fs.writeFileSync(fileInfo.filePath, modified, 'utf8');
        return true;
    }
    return false;
}

// ── Shared directory operations ──────────────────────────────────────────────

function collectFiles(targetPath) {
    if (!fs.existsSync(targetPath)) return null;

    const stats = fs.statSync(targetPath);
    const files = stats.isDirectory()
        ? walkDirectory(targetPath)
        : (() => {
              const ext = path.extname(targetPath).toLowerCase();
              if (SUPPORTED_EXTENSIONS[ext]) {
                  return [{ filePath: targetPath, language: SUPPORTED_EXTENSIONS[ext] }];
              }
              return null;
          })();

    return files && files.length > 0 ? files : null;
}

function analyzeDirectory(targetPath) {
    const files = collectFiles(targetPath);
    if (!files) return [];

    let allResults = [];
    for (const file of files) {
        try {
            const results = analyzeFile(file);
            allResults.push(...results);
        } catch (err) {
            console.error(`Error analyzing ${file.filePath}: ${err.message}`);
        }
    }
    return allResults;
}

function updateDirectory(targetPath) {
    const files = collectFiles(targetPath);
    if (!files) return 0;

    let count = 0;
    for (const file of files) {
        try {
            if (editFile(file)) count++;
        } catch (err) {
            console.error(`Error editing ${file.filePath}: ${err.message}`);
        }
    }
    return count;
}

// ── CLI entry ──────────────────────────────────────────────────────────────────

function main() {
    const args = process.argv.slice(2);
    if (args.length < 2) {
        console.error('Usage: node cli.js --analyze|--update <path>');
        process.exit(1);
    }

    const command = args[0];
    const targetPath = path.resolve(args[1]);

    const files = collectFiles(targetPath);
    if (!files) {
        console.error('No supported files found.');
        process.exit(0);
    }

    if (command === '--analyze') {
        const allResults = analyzeDirectory(targetPath);
        const csvPath = path.resolve('ccm_analysis.csv');
        fs.writeFileSync(csvPath, toCsv(allResults), 'utf8');
        console.error(`Results written to ${csvPath}`);
    } else if (command === '--update') {
        const count = updateDirectory(targetPath);
        console.error(`Processed ${count} file(s).`);
    } else {
        console.error(`Unknown command: ${command}. Use '--analyze' or '--update'.`);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = {
    walkDirectory,
    analyzeFile,
    editFile,
    toCsv,
    findDocstringRange,
    findPythonDocstringRange,
    upsertComplexityTagJavaLike,
    upsertComplexityTagPython,
    addJavaLikeDocstring,
    addPythonDocstring,
    collectFiles,
    analyzeDirectory,
    updateDirectory,
    main
};
