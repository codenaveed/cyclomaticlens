const fs = require('fs');
const path = require('path');
const analyzer = require('../analyzer.js');

// Extract the needed functions from the analyzer
const parseCFunctions = analyzer.parseCFunctions;
const parseJavaFunctions = analyzer.parseJavaFunctions;
const parseJavaScriptFunctions = analyzer.parseJavaScriptFunctions;
const parsePythonFunctions = analyzer.parsePythonFunctions;
const calculateComplexity = analyzer.calculateComplexity;

// EXPECTED VALUES (same as your Python)
const EXPECTED_CC_VALUES_BY_LANGUAGE = {
    C: {
        1: 1, 2: 2, 3: 2, 4: 3, 5: 2, 6: 2, 7: 3, 8: 3, 9: 2, 10: 3,
        11: 4, 12: 3, 13: 3, 14: 3, 15: 4, 16: 3, 17: 3, 18: 3, 19: 4, 20: 4,
        21: 4, 22: 3, 23: 3, 24: 4, 25: 4, 26: 5, 27: 4, 28: 3, 29: 4, 30: 4,
        31: 14, 32: 22, 33: 2, 34: 2, 35: 4, 36: 2, 37: 2,
    },
    Java: {
        1: 1, 2: 2, 3: 2, 4: 3, 5: 2, 6: 2, 7: 3, 8: 3, 9: 2, 10: 3,
        11: 4, 12: 3, 13: 3, 14: 3, 15: 4, 16: 3, 17: 3, 18: 3, 19: 4, 20: 4,
        21: 4, 22: 3, 23: 3, 24: 4, 25: 4, 26: 5, 27: 4, 28: 3, 29: 4, 30: 4,
        31: 14, 32: 22,
    },
    JavaScript: {
        1: 1, 2: 2, 3: 2, 4: 3, 5: 2, 6: 2, 7: 3, 8: 3, 9: 2, 10: 3,
        11: 4, 12: 3, 13: 3, 14: 3, 15: 4, 16: 3, 17: 3, 18: 3, 19: 4, 20: 4,
        21: 4, 22: 3, 23: 3, 24: 4, 25: 4, 26: 5, 27: 4, 28: 3, 29: 4, 30: 4,
        31: 14, 32: 22,
    },
    TypeScript: {
        1: 1, 2: 2, 3: 2, 4: 3, 5: 2, 6: 2, 7: 3, 8: 3, 9: 2, 10: 3,
        11: 4, 12: 3, 13: 3, 14: 3, 15: 4, 16: 3, 17: 3, 18: 3, 19: 4, 20: 4,
        21: 4, 22: 3, 23: 3, 24: 4, 25: 4, 26: 5, 27: 4, 28: 3, 29: 4, 30: 4,
        31: 14, 32: 22,
    },
    Python: {
        1: 1, 2: 2, 3: 2, 4: 3, 5: 2, 6: 2, 7: 3, 8: 3, 9: 2, 10: 3,
        11: 4, 12: 3, 13: 3, 14: 3, 15: 4, 16: 3, 17: 3, 18: 3, 19: 4, 20: 4,
        21: 4, 22: 3, 23: 3, 24: 4, 25: 4, 26: 5, 27: 4, 28: 3, 29: 4, 30: 4,
        31: 14, 32: 22,
    },
    'C++': {
        1: 1, 2: 2, 3: 2, 4: 3, 5: 2, 6: 2, 7: 3, 8: 3, 9: 2, 10: 3,
        11: 4, 12: 3, 13: 3, 14: 3, 15: 4, 16: 3, 17: 3, 18: 3, 19: 4, 20: 4,
        21: 4, 22: 3, 23: 3, 24: 4, 25: 4, 26: 5, 27: 4, 28: 3, 29: 4, 30: 4,
        31: 14, 32: 22,
    }
};

// TEST FILES
const examples = path.join(__dirname, '../examples');

describe('Cyclomatic Complexity Analyzer Tests', () => {
    describe('C language tests', () => {
        const code = fs.readFileSync(path.join(examples, 'example.c'), 'utf-8');
        const functions = parseCFunctions(code);
        const expected = EXPECTED_CC_VALUES_BY_LANGUAGE.C;

        functions.forEach((func, index) => {
            const funcId = index + 1;
            const expectedCC = expected[funcId];

            if (expectedCC === null) return; // skip

            test(`C function ${funcId}: ${func.name || 'anonymous'}`, () => {
                const computed = calculateComplexity(func.body, 'c');
                expect(computed).toBe(expectedCC);
            });
        });
    });

    describe('Java language tests', () => {
        const code = fs.readFileSync(path.join(examples, 'Example.java'), 'utf-8');
        const functions = parseJavaFunctions(code);
        const expected = EXPECTED_CC_VALUES_BY_LANGUAGE.Java;

        functions.forEach((func, index) => {
            const funcId = index + 1;
            const expectedCC = expected[funcId];

            if (expectedCC === null) return; // skip

            test(`Java function ${funcId}: ${func.name || 'anonymous'}`, () => {
                const computed = calculateComplexity(func.body, 'java');
                expect(computed).toBe(expectedCC);
            });
        });
    });

    describe('JavaScript language tests', () => {
        const code = fs.readFileSync(path.join(examples, 'example.js'), 'utf-8');
        const functions = parseJavaScriptFunctions(code);
        const expected = EXPECTED_CC_VALUES_BY_LANGUAGE.JavaScript;
        functions.forEach((func, index) => {
            const funcId = index + 1;
            const expectedCC = expected[funcId];

            if (expectedCC === null) return; // skip

            test(`JavaScript function ${funcId}: ${func.name || 'anonymous'}`, () => {
                const computed = calculateComplexity(func.body, 'javascript');
                expect(computed).toBe(expectedCC);
            });
        });
    });

    describe('TypeScript language tests', () => {
        const code = fs.readFileSync(path.join(examples, 'example.ts'), 'utf-8');
        const functions = parseJavaScriptFunctions(code); // TypeScript uses same parser as JavaScript
        const expected = EXPECTED_CC_VALUES_BY_LANGUAGE.TypeScript;
        functions.forEach((func, index) => {
            const funcId = index + 1;
            const expectedCC = expected[funcId];

            if (expectedCC === null) return; // skip

            test(`TypeScript function ${funcId}: ${func.name || 'anonymous'}`, () => {
                const computed = calculateComplexity(func.body, 'typescript');
                expect(computed).toBe(expectedCC);
            });
        });
    });

    describe('Python language tests', () => {
        const code = fs.readFileSync(path.join(examples, 'example.py'), 'utf-8');
        const functions = parsePythonFunctions(code);
        const expected = EXPECTED_CC_VALUES_BY_LANGUAGE.Python;

        functions.forEach((func, index) => {
            const funcId = index + 1;
            const expectedCC = expected[funcId];

            if (expectedCC === null) return; // skip

            test(`Python function ${funcId}: ${func.name || 'anonymous'}`, () => {
                const computed = calculateComplexity(func.body, 'python');
                expect(computed).toBe(expectedCC);
            });
        });
    });

    describe('C++ language tests', () => {
        const code = fs.readFileSync(path.join(examples, 'example.cpp'), 'utf-8');
        const functions = parseCFunctions(code); // C++ uses same parser as C
        const expected = EXPECTED_CC_VALUES_BY_LANGUAGE['C++'];

        functions.forEach((func, index) => {
            const funcId = index + 1;
            const expectedCC = expected[funcId];

            if (expectedCC === null) return; // skip

            test(`C++ function ${funcId}: ${func.name || 'anonymous'}`, () => {
                const computed = calculateComplexity(func.body, 'c');
                expect(computed).toBe(expectedCC);
            });
        });
    });
});
