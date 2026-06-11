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

// ── analyzeFile tests ──────────────────────────────────────────────────────

describe('CCM CLI - analyzeFile', () => {
    let tmpDir;

    beforeEach(() => { tmpDir = createTempDir(); });
    afterEach(() => { removeTempDir(tmpDir); });

    test('computes CCM for Java file', () => {
        const filePath = copyFixtureToTemp(tmpDir, 'java/edit_add.java');
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
        const filePath = copyFixtureToTemp(tmpDir, 'py/edit_add.py');
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
        const filePath = copyFixtureToTemp(tmpDir, 'c/edit_add.c');
        const results = cli.analyzeFile({ filePath, language: 'c' });
        expect(results).toHaveLength(2);
        expect(results[0].function).toBe('do_stuff');
        expect(results[0].ccm).toBe(2);
        expect(results[0].level).toBe('Low');
        expect(results[1].function).toBe('noop');
        expect(results[1].ccm).toBe(1);
        expect(results[1].level).toBe('Low');
    });

    test('computes CCM for C++ file', () => {
        const filePath = copyFixtureToTemp(tmpDir, 'cpp/edit_add.cpp');
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
    test('outputs header and rows with comma delimiter', () => {
        const results = [
            { path: '/src', file: 'Foo.java', function: 'bar', ccm: 3, level: 'Low' },
            { path: '/src', file: 'Baz.java', function: 'qux', ccm: 15, level: 'Medium' }
        ];
        const csv = cli.toCsv(results);
        const lines = csv.split('\n');
        expect(lines[0]).toBe('Path,File,Function,CCM,Complexity');
        expect(lines[1]).toBe('/src,Foo.java,bar,3,Low');
        expect(lines[2]).toBe('/src,Baz.java,qux,15,Medium');
    });

    test('escapes commas in function names with quotes', () => {
        const results = [
            { path: '/src', file: 'f.js', function: 'a,b', ccm: 1, level: 'Low' }
        ];
        const csv = cli.toCsv(results);
        expect(csv).toContain('"a,b"');
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

// ── Integration tests: edit mode ───────────────────────────────────────────

describe('CCM CLI - editFile integration', () => {
    let tmpDir;

    beforeEach(() => { tmpDir = createTempDir(); });
    afterEach(() => { removeTempDir(tmpDir); });

    test('Java: adds @complexity tag to all functions with docstrings', () => {
        const filePath = copyFixtureToTemp(tmpDir, 'java/edit_add.java');
        cli.editFile({ filePath, language: 'java' });
        const edited = fs.readFileSync(filePath, 'utf8');
        expect(edited).toContain('* @complexity Low');
        expect((edited.match(/@complexity Low/g) || []).length).toBe(2);
    });

    test('Java: overwrites existing @complexity tag', () => {
        const filePath = copyFixtureToTemp(tmpDir, 'java/edit_overwrite.java');
        cli.editFile({ filePath, language: 'java' });
        const edited = fs.readFileSync(filePath, 'utf8');
        expect(edited).toContain('* @complexity Low');
        expect((edited.match(/@complexity Low/g) || []).length).toBe(2);
        expect(edited).not.toContain('@complexity High');
    });

    test('Java: adds tag before */ when no tags exist', () => {
        const filePath = copyFixtureToTemp(tmpDir, 'java/edit_notags.java');
        cli.editFile({ filePath, language: 'java' });
        const edited = fs.readFileSync(filePath, 'utf8');
        expect((edited.match(/@complexity Low/g) || []).length).toBe(2);
    });

    test('Java: adds docstring + tag to undocumented functions', () => {
        const filePath = copyFixtureToTemp(tmpDir, 'java/edit_nodoc.java');
        cli.editFile({ filePath, language: 'java' });
        const edited = fs.readFileSync(filePath, 'utf8');
        expect(edited).toContain('/**');
        expect(edited).toContain('@complexity Low');
        expect(edited).toContain('public int add');
        expect(edited).toContain('public int multiply');
    });

    test('Java: handles multiple functions with different CCM levels', () => {
        const filePath = copyFixtureToTemp(tmpDir, 'java/edit_multi.java');
        cli.editFile({ filePath, language: 'java' });
        const edited = fs.readFileSync(filePath, 'utf8');
        expect(edited).toContain('@complexity Low');
        expect(edited).toContain('@complexity Medium');
    });

    test('JavaScript: adds @complexity tag to all functions', () => {
        const filePath = copyFixtureToTemp(tmpDir, 'js/edit_add.js');
        cli.editFile({ filePath, language: 'javascript' });
        const edited = fs.readFileSync(filePath, 'utf8');
        expect((edited.match(/@complexity Low/g) || []).length).toBe(2);
    });

    test('JavaScript: overwrites existing @complexity tag', () => {
        const filePath = copyFixtureToTemp(tmpDir, 'js/edit_overwrite.js');
        cli.editFile({ filePath, language: 'javascript' });
        const edited = fs.readFileSync(filePath, 'utf8');
        expect(edited).toContain('@complexity Low');
        expect(edited).not.toContain('@complexity High');
    });

    test('JavaScript: adds docstring + tag to undocumented functions', () => {
        const filePath = copyFixtureToTemp(tmpDir, 'js/edit_nodoc.js');
        cli.editFile({ filePath, language: 'javascript' });
        const edited = fs.readFileSync(filePath, 'utf8');
        expect(edited).toContain('/**');
        expect(edited).toContain('@complexity Low');
        expect(edited).toContain('function doStuff');
        expect(edited).toContain('function noop');
    });

    test('JavaScript: handles multiple functions with different CCM levels', () => {
        const filePath = copyFixtureToTemp(tmpDir, 'js/edit_multi.js');
        cli.editFile({ filePath, language: 'javascript' });
        const edited = fs.readFileSync(filePath, 'utf8');
        expect(edited).toContain('@complexity Low');
        expect(edited).toContain('@complexity Medium');
    });

    test('TypeScript: adds @complexity tag to all functions', () => {
        const filePath = copyFixtureToTemp(tmpDir, 'ts/edit_add.ts');
        cli.editFile({ filePath, language: 'typescript' });
        const edited = fs.readFileSync(filePath, 'utf8');
        expect((edited.match(/@complexity Low/g) || []).length).toBe(2);
    });

    test('TypeScript: overwrites existing @complexity tag', () => {
        const filePath = copyFixtureToTemp(tmpDir, 'ts/edit_overwrite.ts');
        cli.editFile({ filePath, language: 'typescript' });
        const edited = fs.readFileSync(filePath, 'utf8');
        expect(edited).toContain('@complexity Low');
        expect(edited).not.toContain('@complexity High');
    });

    test('TypeScript: adds docstring + tag to undocumented functions', () => {
        const filePath = copyFixtureToTemp(tmpDir, 'ts/edit_nodoc.ts');
        cli.editFile({ filePath, language: 'typescript' });
        const edited = fs.readFileSync(filePath, 'utf8');
        expect(edited).toContain('/**');
        expect(edited).toContain('@complexity Low');
        expect(edited).toContain('function doStuff');
        expect(edited).toContain('function noop');
    });

    test('TypeScript: handles multiple functions with different CCM levels', () => {
        const filePath = copyFixtureToTemp(tmpDir, 'ts/edit_multi.ts');
        cli.editFile({ filePath, language: 'typescript' });
        const edited = fs.readFileSync(filePath, 'utf8');
        expect(edited).toContain('@complexity Low');
        expect(edited).toContain('@complexity Medium');
    });

    test('C: adds @complexity tag to all functions', () => {
        const filePath = copyFixtureToTemp(tmpDir, 'c/edit_add.c');
        cli.editFile({ filePath, language: 'c' });
        const edited = fs.readFileSync(filePath, 'utf8');
        expect((edited.match(/@complexity Low/g) || []).length).toBe(2);
    });

    test('C: overwrites existing @complexity tag', () => {
        const filePath = copyFixtureToTemp(tmpDir, 'c/edit_overwrite.c');
        cli.editFile({ filePath, language: 'c' });
        const edited = fs.readFileSync(filePath, 'utf8');
        expect(edited).toContain('@complexity Low');
        expect(edited).not.toContain('@complexity High');
    });

    test('C: adds docstring + tag to undocumented functions', () => {
        const filePath = copyFixtureToTemp(tmpDir, 'c/edit_nodoc.c');
        cli.editFile({ filePath, language: 'c' });
        const edited = fs.readFileSync(filePath, 'utf8');
        expect(edited).toContain('/**');
        expect(edited).toContain('@complexity Low');
        expect(edited).toContain('int foo()');
        expect(edited).toContain('int bar()');
    });

    test('C: handles multiple functions with different CCM levels', () => {
        const filePath = copyFixtureToTemp(tmpDir, 'c/edit_multi.c');
        cli.editFile({ filePath, language: 'c' });
        const edited = fs.readFileSync(filePath, 'utf8');
        expect(edited).toContain('@complexity Low');
        expect(edited).toContain('@complexity Medium');
    });

    test('C++: adds @complexity tag to all functions', () => {
        const filePath = copyFixtureToTemp(tmpDir, 'cpp/edit_add.cpp');
        cli.editFile({ filePath, language: 'c' });
        const edited = fs.readFileSync(filePath, 'utf8');
        expect((edited.match(/@complexity Low/g) || []).length).toBe(2);
    });

    test('C++: overwrites existing @complexity tag', () => {
        const filePath = copyFixtureToTemp(tmpDir, 'cpp/edit_overwrite.cpp');
        cli.editFile({ filePath, language: 'c' });
        const edited = fs.readFileSync(filePath, 'utf8');
        expect(edited).toContain('@complexity Low');
        expect(edited).not.toContain('@complexity High');
    });

    test('C++: adds docstring + tag to undocumented functions', () => {
        const filePath = copyFixtureToTemp(tmpDir, 'cpp/edit_nodoc.cpp');
        cli.editFile({ filePath, language: 'c' });
        const edited = fs.readFileSync(filePath, 'utf8');
        expect(edited).toContain('/**');
        expect(edited).toContain('@complexity Low');
        expect(edited).toContain('void foo()');
        expect(edited).toContain('void bar()');
    });

    test('C++: handles multiple functions with different CCM levels', () => {
        const filePath = copyFixtureToTemp(tmpDir, 'cpp/edit_multi.cpp');
        cli.editFile({ filePath, language: 'c' });
        const edited = fs.readFileSync(filePath, 'utf8');
        expect(edited).toContain('@complexity Low');
        expect(edited).toContain('@complexity Medium');
    });

    test('Python: adds complexity line to all docstrings', () => {
        const filePath = copyFixtureToTemp(tmpDir, 'py/edit_add.py');
        cli.editFile({ filePath, language: 'python' });
        const edited = fs.readFileSync(filePath, 'utf8');
        expect(edited).toContain('complexity Low');
        expect((edited.match(/complexity Low/g) || []).length).toBe(2);
    });

    test('Python: overwrites existing complexity line', () => {
        const filePath = copyFixtureToTemp(tmpDir, 'py/edit_overwrite.py');
        cli.editFile({ filePath, language: 'python' });
        const edited = fs.readFileSync(filePath, 'utf8');
        expect(edited).toContain('complexity Low');
        expect(edited).not.toContain('Very High');
    });

    test('Python: adds docstring + tag to undocumented functions', () => {
        const filePath = copyFixtureToTemp(tmpDir, 'py/edit_nodoc.py');
        cli.editFile({ filePath, language: 'python' });
        const edited = fs.readFileSync(filePath, 'utf8');
        expect(edited).toContain('"""complexity Low');
        expect(edited).toContain('def noop()');
        expect(edited).toContain('def do_stuff(x)');
    });

    test('Python: handles multiple functions with different CCM levels', () => {
        const filePath = copyFixtureToTemp(tmpDir, 'py/edit_multi.py');
        cli.editFile({ filePath, language: 'python' });
        const edited = fs.readFileSync(filePath, 'utf8');
        expect(edited).toContain('complexity Low');
        expect(edited).toContain('complexity Medium');
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

describe('CCM CLI - tag ordering with existing tags', () => {
    let tmpDir;

    beforeEach(() => { tmpDir = createTempDir(); });
    afterEach(() => { removeTempDir(tmpDir); });

    test('C: places @complexity after the last existing tag', () => {
        const filePath = copyFixtureToTemp(tmpDir, 'c/edit_tags.c');
        cli.editFile({ filePath, language: 'c' });
        const edited = fs.readFileSync(filePath, 'utf8');
        expect(edited.indexOf('@complexity Low')).toBeGreaterThan(edited.indexOf('@return'));
    });

    test('C++: places @complexity after the last existing tag', () => {
        const filePath = copyFixtureToTemp(tmpDir, 'cpp/edit_tags.cpp');
        cli.editFile({ filePath, language: 'c' });
        const edited = fs.readFileSync(filePath, 'utf8');
        expect(edited.indexOf('@complexity Low')).toBeGreaterThan(edited.indexOf('@return'));
    });

    test('Java: places @complexity after the last existing tag', () => {
        const filePath = copyFixtureToTemp(tmpDir, 'java/edit_tags.java');
        cli.editFile({ filePath, language: 'java' });
        const edited = fs.readFileSync(filePath, 'utf8');
        expect(edited.indexOf('@complexity Low')).toBeGreaterThan(edited.indexOf('@return'));
    });

    test('JavaScript: places @complexity after the last existing tag', () => {
        const filePath = copyFixtureToTemp(tmpDir, 'js/edit_tags.js');
        cli.editFile({ filePath, language: 'javascript' });
        const edited = fs.readFileSync(filePath, 'utf8');
        expect(edited.indexOf('@complexity Low')).toBeGreaterThan(edited.indexOf('@returns'));
    });

    test('TypeScript: places @complexity after the last existing tag', () => {
        const filePath = copyFixtureToTemp(tmpDir, 'ts/edit_tags.ts');
        cli.editFile({ filePath, language: 'typescript' });
        const edited = fs.readFileSync(filePath, 'utf8');
        expect(edited.indexOf('@complexity Low')).toBeGreaterThan(edited.indexOf('@returns'));
    });

    test('Python: places complexity before closing quotes', () => {
        const filePath = copyFixtureToTemp(tmpDir, 'py/edit_tags.py');
        cli.editFile({ filePath, language: 'python' });
        const edited = fs.readFileSync(filePath, 'utf8');
        expect(edited.indexOf('complexity Low')).toBeGreaterThan(edited.indexOf('Returns:'));
        const lastClose = edited.lastIndexOf('"""');
        expect(edited.indexOf('complexity Low')).toBeLessThan(lastClose);
    });
});


