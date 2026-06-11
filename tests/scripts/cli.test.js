const fs = require('fs');
const path = require('path');
const os = require('os');
const cli = require('../../extension/cli.js');
const core = require('../../extension/core.js');

// ── Fixture helpers ───────────────────────────────────────────────────────────

const FIXTURES_DIR = path.join(__dirname, '../examples_cli');

function copyFixtureToTemp(tmpDir, relPath) {
    const src = path.join(FIXTURES_DIR, relPath);
    const content = fs.readFileSync(src, 'utf8');
    const dest = path.join(tmpDir, path.basename(relPath));
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, content, 'utf8');
    return dest;
}

function copyFixtureDirToTemp(tmpDir, relDir) {
    const src = path.join(FIXTURES_DIR, relDir);
    const dest = path.join(tmpDir, relDir);
    function copyRec(s, d) {
        fs.mkdirSync(d, { recursive: true });
        for (const entry of fs.readdirSync(s, { withFileTypes: true })) {
            const sp = path.join(s, entry.name);
            const dp = path.join(d, entry.name);
            if (entry.isDirectory()) copyRec(sp, dp);
            else fs.copyFileSync(sp, dp);
        }
    }
    copyRec(src, dest);
    return dest;
}

function createTempDir() {
    return fs.mkdtempSync(path.join(os.tmpdir(), 'ccm-test-'));
}

function writeFile(dir, relPath, content) {
    const full = path.join(dir, relPath);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content, 'utf8');
    return full;
}

function removeTempDir(dir) {
    fs.rmSync(dir, { recursive: true, force: true });
}

// ── walkDirectory tests ──────────────────────────────────────────────────────

describe('CCM CLI - walkDirectory', () => {
    let tmpDir;

    beforeEach(() => { tmpDir = createTempDir(); });
    afterEach(() => { removeTempDir(tmpDir); });

    test('discovers supported files recursively', () => {
        writeFile(tmpDir, 'a.java', 'class A {}');
        writeFile(tmpDir, 'sub/b.py', 'def f(): pass');
        writeFile(tmpDir, 'sub/deep/c.js', 'function x() {}');
        writeFile(tmpDir, 'ignore.txt', 'text');

        const files = cli.walkDirectory(tmpDir);
        expect(files).toHaveLength(3);
        expect(files.map(f => path.basename(f.filePath)).sort())
            .toEqual(['a.java', 'b.py', 'c.js']);
    });

    test('skips node_modules and hidden dirs', () => {
        writeFile(tmpDir, 'src/a.java', 'class A {}');
        writeFile(tmpDir, 'node_modules/b.java', 'class B {}');
        writeFile(tmpDir, '.git/c.java', 'class C {}');

        const files = cli.walkDirectory(tmpDir);
        expect(files).toHaveLength(1);
        expect(path.basename(files[0].filePath)).toBe('a.java');
    });

    test('assigns correct language based on extension', () => {
        writeFile(tmpDir, 'a.c', '');
        writeFile(tmpDir, 'b.cpp', '');
        writeFile(tmpDir, 'c.h', '');
        writeFile(tmpDir, 'd.java', '');
        writeFile(tmpDir, 'e.js', '');
        writeFile(tmpDir, 'f.ts', '');
        writeFile(tmpDir, 'g.tsx', '');
        writeFile(tmpDir, 'h.py', '');
        writeFile(tmpDir, 'i.hpp', '');

        const files = cli.walkDirectory(tmpDir);
        const map = Object.fromEntries(files.map(f => [path.extname(f.filePath), f.language]));
        expect(map['.c']).toBe('c');
        expect(map['.cpp']).toBe('c');
        expect(map['.h']).toBe('c');
        expect(map['.hpp']).toBe('c');
        expect(map['.java']).toBe('java');
        expect(map['.js']).toBe('javascript');
        expect(map['.ts']).toBe('typescript');
        expect(map['.tsx']).toBe('typescript');
        expect(map['.py']).toBe('python');
    });
});

// ── analyzeFile tests (uses fixture files) ──────────────────────────────────

describe('CCM CLI - analyzeFile', () => {
    let tmpDir;

    beforeEach(() => { tmpDir = createTempDir(); });
    afterEach(() => { removeTempDir(tmpDir); });

    test('computes CCM for Java file', () => {
        const filePath = copyFixtureToTemp(tmpDir, 'edit_java_add.java');
        const results = cli.analyzeFile({ filePath, language: 'java' });
        expect(results).toHaveLength(2);
        expect(results[0].function).toBe('add');
        expect(results[0].ccm).toBe(1);
        expect(results[0].level).toBe('Low');
        expect(results[1].function).toBe('multiply');
        expect(results[1].ccm).toBe(1);
        expect(results[1].level).toBe('Low');
    });

    test('computes CCM for Python file', () => {
        const filePath = copyFixtureToTemp(tmpDir, 'edit_py_add.py');
        const results = cli.analyzeFile({ filePath, language: 'python' });
        expect(results).toHaveLength(2);
        expect(results[0].function).toBe('noop');
        expect(results[0].ccm).toBe(1);
        expect(results[0].level).toBe('Low');
        expect(results[1].function).toBe('do_stuff');
        expect(results[1].ccm).toBe(2);
        expect(results[1].level).toBe('Low');
    });

    test('computes CCM for C file', () => {
        const filePath = copyFixtureToTemp(tmpDir, 'edit_c_add.c');
        const results = cli.analyzeFile({ filePath, language: 'c' });
        expect(results).toHaveLength(2);
        expect(results[0].function).toBe('do_stuff');
        expect(results[0].ccm).toBe(2);
        expect(results[0].level).toBe('Low');
        expect(results[1].function).toBe('noop');
        expect(results[1].ccm).toBe(1);
        expect(results[1].level).toBe('Low');
    });

    test('handles empty file gracefully', () => {
        const filePath = writeFile(tmpDir, 'empty.java', '');
        const results = cli.analyzeFile({ filePath, language: 'java' });
        expect(results).toEqual([]);
    });
});

// ── toCsv tests ─────────────────────────────────────────────────────────────

describe('CCM CLI - toCsv', () => {
    test('outputs header and rows with pipe delimiter', () => {
        const results = [
            { path: '/src', file: 'Foo.java', language: 'java', function: 'bar', ccm: 3, level: 'Low' },
            { path: '/src', file: 'Baz.java', language: 'java', function: 'qux', ccm: 15, level: 'Medium' }
        ];
        const csv = cli.toCsv(results);
        const lines = csv.split('\n');
        expect(lines[0]).toBe('Path|File|Language|Function|CCM|Complexity');
        expect(lines[1]).toBe('/src|Foo.java|java|bar|3|Low');
        expect(lines[2]).toBe('/src|Baz.java|java|qux|15|Medium');
    });

    test('escapes pipe characters in function names', () => {
        const results = [
            { path: '/src', file: 'f.js', language: 'javascript', function: 'a|b', ccm: 1, level: 'Low' }
        ];
        const csv = cli.toCsv(results);
        expect(csv).toContain('a\\|b');
    });
});

// ── getLevel tests ──────────────────────────────────────────────────────────

describe('CCM CLI - getLevel (via core)', () => {
    test('maps scores to correct levels', () => {
        expect(core.getLevel(0)).toBe('Low');
        expect(core.getLevel(10)).toBe('Low');
        expect(core.getLevel(11)).toBe('Medium');
        expect(core.getLevel(20)).toBe('Medium');
        expect(core.getLevel(21)).toBe('High');
        expect(core.getLevel(30)).toBe('High');
        expect(core.getLevel(31)).toBe('Very High');
        expect(core.getLevel(50)).toBe('Very High');
        expect(core.getLevel(51)).toBe('Critical');
        expect(core.getLevel(100)).toBe('Critical');
    });
});

// ── Docstring finder tests ──────────────────────────────────────────────────

describe('CCM CLI - findDocstringRange (Java-like)', () => {
    test('finds docstring directly above a function', () => {
        const lines = [
            '/**',
            ' * Does foo.',
            ' */',
            'void foo() {}'
        ];
        const r = cli.findDocstringRange(lines, 3);
        expect(r).toEqual({ startLine: 0, endLine: 2 });
    });

    test('skips blank lines and annotations between docstring and function', () => {
        const lines = [
            '/**',
            ' * Does foo.',
            ' */',
            '',
            '@Override',
            'void foo() {}'
        ];
        const r = cli.findDocstringRange(lines, 5);
        expect(r).toEqual({ startLine: 0, endLine: 2 });
    });

    test('finds single-line docstring /** ... */', () => {
        const lines = [
            '/** Does foo. */',
            'void foo() {}'
        ];
        const r = cli.findDocstringRange(lines, 1);
        expect(r).toEqual({ startLine: 0, endLine: 0 });
    });

    test('returns null when no docstring found', () => {
        const lines = [
            '// comment',
            'void foo() {}'
        ];
        const r = cli.findDocstringRange(lines, 1);
        expect(r).toBeNull();
    });

    test('returns null for plain comment blocks (not docstrings)', () => {
        const lines = [
            '/*',
            ' * plain comment',
            ' */',
            'void foo() {}'
        ];
        const r = cli.findDocstringRange(lines, 3);
        expect(r).toBeNull();
    });
});

describe('CCM CLI - findPythonDocstringRange', () => {
    test('finds triple-quoted docstring', () => {
        const lines = [
            'def foo():',
            '    """Does foo.',
            '    More detail.',
            '    """',
            '    pass'
        ];
        const r = cli.findPythonDocstringRange(lines, 0);
        expect(r).toEqual({ startLine: 1, endLine: 3 });
    });

    test('finds single-line docstring', () => {
        const lines = [
            'def foo():',
            '    """Does foo."""',
            '    pass'
        ];
        const r = cli.findPythonDocstringRange(lines, 0);
        expect(r).toEqual({ startLine: 1, endLine: 1 });
    });

    test('finds single-quoted docstring', () => {
        const lines = [
            'def foo():',
            "    '''Does foo.'''",
            '    pass'
        ];
        const r = cli.findPythonDocstringRange(lines, 0);
        expect(r).toEqual({ startLine: 1, endLine: 1 });
    });

    test('returns null when no docstring present', () => {
        const lines = [
            'def foo():',
            '    pass'
        ];
        const r = cli.findPythonDocstringRange(lines, 0);
        expect(r).toBeNull();
    });
});

// ── Tag upsert tests ────────────────────────────────────────────────────────

describe('CCM CLI - upsertComplexityTagJavaLike', () => {
    test('adds tag after last existing tag', () => {
        const lines = [
            '/**',
            ' * Does foo.',
            ' * @param x the x',
            ' * @return the result',
            ' */',
            'int foo(int x) { return x; }'
        ];
        cli.upsertComplexityTagJavaLike(lines, { startLine: 0, endLine: 4 }, 'Low');
        expect(lines[4]).toContain('* @complexity Low');
    });

    test('replaces existing @complexity tag in place', () => {
        const lines = [
            '/**',
            ' * Does foo.',
            ' * @param x the x',
            ' * @complexity High',
            ' * @return the result',
            ' */',
            'int foo(int x) { return x; }'
        ];
        cli.upsertComplexityTagJavaLike(lines, { startLine: 0, endLine: 5 }, 'Low');
        expect(lines[3]).toContain('* @complexity Low');
    });

    test('adds tag before closing */ when no tags exist', () => {
        const lines = [
            '/**',
            ' * Does foo.',
            ' */',
            'int foo() { return 1; }'
        ];
        cli.upsertComplexityTagJavaLike(lines, { startLine: 0, endLine: 2 }, 'Low');
        expect(lines[2]).toContain('* @complexity Low');
    });
});

describe('CCM CLI - upsertComplexityTagPython', () => {
    test('adds complexity line at end of docstring', () => {
        const lines = [
            'def foo():',
            '    """Does foo.',
            '',
            '    Returns:',
            '        the result',
            '    """',
            '    pass'
        ];
        cli.upsertComplexityTagPython(lines, { startLine: 1, endLine: 5 }, 'Low');
        expect(lines[5]).toContain('complexity Low');
    });

    test('replaces existing complexity line in place', () => {
        const lines = [
            'def foo():',
            '    """Does foo.',
            '    complexity High',
            '    """',
            '    pass'
        ];
        cli.upsertComplexityTagPython(lines, { startLine: 1, endLine: 3 }, 'Low');
        expect(lines[2]).toContain('complexity Low');
    });
});

// ── Integration tests: edit mode (uses fixture files) ───────────────────────

describe('CCM CLI - editFile integration', () => {
    let tmpDir;

    beforeEach(() => { tmpDir = createTempDir(); });
    afterEach(() => { removeTempDir(tmpDir); });

    test('Java: adds @complexity tag to docstring', () => {
        const filePath = copyFixtureToTemp(tmpDir, 'edit_java_add.java');
        cli.editFile({ filePath, language: 'java' });
        const edited = fs.readFileSync(filePath, 'utf8');
        expect(edited).toContain('* @complexity Low');
    });

    test('Java: overwrites existing @complexity tag', () => {
        const filePath = copyFixtureToTemp(tmpDir, 'edit_java_overwrite.java');
        cli.editFile({ filePath, language: 'java' });
        const edited = fs.readFileSync(filePath, 'utf8');
        expect(edited).toContain('* @complexity Low');
        expect(edited).not.toContain('@complexity High');
    });

    test('Java: adds tag before */ when no tags exist', () => {
        const filePath = copyFixtureToTemp(tmpDir, 'edit_java_notags.java');
        cli.editFile({ filePath, language: 'java' });
        const edited = fs.readFileSync(filePath, 'utf8');
        expect(edited).toContain('* @complexity Low');
    });

    test('JavaScript: adds @complexity tag', () => {
        const filePath = copyFixtureToTemp(tmpDir, 'edit_js_add.js');
        cli.editFile({ filePath, language: 'javascript' });
        const edited = fs.readFileSync(filePath, 'utf8');
        expect(edited).toContain('* @complexity Low');
    });

    test('TypeScript: adds @complexity tag', () => {
        const filePath = copyFixtureToTemp(tmpDir, 'edit_ts_add.ts');
        cli.editFile({ filePath, language: 'typescript' });
        const edited = fs.readFileSync(filePath, 'utf8');
        expect(edited).toContain('* @complexity Low');
    });

    test('C: adds @complexity tag', () => {
        const filePath = copyFixtureToTemp(tmpDir, 'edit_c_add.c');
        cli.editFile({ filePath, language: 'c' });
        const edited = fs.readFileSync(filePath, 'utf8');
        expect(edited).toContain('* @complexity Low');
    });

    test('Python: adds complexity line to docstring', () => {
        const filePath = copyFixtureToTemp(tmpDir, 'edit_py_add.py');
        cli.editFile({ filePath, language: 'python' });
        const edited = fs.readFileSync(filePath, 'utf8');
        expect(edited).toContain('complexity Low');
    });

    test('Python: overwrites existing complexity line', () => {
        const filePath = copyFixtureToTemp(tmpDir, 'edit_py_overwrite.py');
        cli.editFile({ filePath, language: 'python' });
        const edited = fs.readFileSync(filePath, 'utf8');
        expect(edited).toContain('complexity Low');
        expect(edited).not.toContain('Very High');
    });

    test('processes multiple functions in a file bottom-to-top', () => {
        const filePath = copyFixtureToTemp(tmpDir, 'edit_c_multi.c');
        cli.editFile({ filePath, language: 'c' });
        const edited = fs.readFileSync(filePath, 'utf8');
        expect(edited).toContain('@complexity Low');
        expect(edited).toContain('@complexity Medium');
    });

    test('does not modify file without docstrings', () => {
        const filePath = copyFixtureToTemp(tmpDir, 'edit_c_nodoc.c');
        const before = fs.readFileSync(filePath, 'utf8');
        cli.editFile({ filePath, language: 'c' });
        const after = fs.readFileSync(filePath, 'utf8');
        expect(after).toBe(before);
    });

    test('recursively processes files across languages and depth', () => {
        const dest = copyFixtureDirToTemp(tmpDir, 'recurse');
        const files = cli.walkDirectory(dest);
        const cFiles = files.filter(f => f.language === 'c');
        const javaFiles = files.filter(f => f.language === 'java');
        expect(cFiles.length).toBeGreaterThanOrEqual(1);
        expect(javaFiles.length).toBeGreaterThanOrEqual(1);
        expect(files.some(f => f.filePath.includes('com/ccm/example'))).toBe(true);
        for (const file of files) {
            cli.editFile(file);
            const edited = fs.readFileSync(file.filePath, 'utf8');
            expect(edited).toContain('@complexity Low');
        }
    });
});

// ── End-to-end analyze via directory (uses fixture files) ───────────────────

describe('CCM CLI - end-to-end analyze via directory', () => {
    let tmpDir;

    beforeEach(() => { tmpDir = createTempDir(); });
    afterEach(() => { removeTempDir(tmpDir); });

    test('analyze all files under a directory produces correct CSV', () => {
        const dir = copyFixtureDirToTemp(tmpDir, 'analyze');
        const files = cli.walkDirectory(dir);
        const allResults = files.flatMap(f => cli.analyzeFile(f));
        const csv = cli.toCsv(allResults);
        const lines = csv.split('\n').filter(l => l);

        expect(lines[0]).toBe('Path|File|Language|Function|CCM|Complexity');
        expect(lines.length).toBe(4);
        const dataLines = lines.slice(1).sort();
        expect(dataLines[0]).toMatch(/\|Bar\.java\|java\|loop\|2\|Low$/);
        expect(dataLines[1]).toMatch(/\|Foo\.java\|java\|branch\|2\|Low$/);
        expect(dataLines[2]).toMatch(/\|Foo\.java\|java\|simple\|1\|Low$/);
    });
});
