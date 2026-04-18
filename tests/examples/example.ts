/**
 * Cyclomatic Complexity Test Suite (TypeScript)
 * Converted from mixed C/Java/JavaScript version
 */

export namespace Example {
    // ========== CASE 1 ==========
    export function c1(): number {
        return 0;
    } 

    // ========== CASE 2 ==========
    export function c2(a: number): number {
        if (a > 0) return 1;
        return 0;
    } 

    // ========== CASE 3 ==========
    export function c3(a: number): number {
        if (a > 0) {}
        else {}
        return 0;
    } 

    // ========== CASE 4 ==========
    export function c4(a: number, b: number): number {
        if (a > 0) return 1;
        if (b > 0) return 2;
        return 0;
    } 

    // ========== CASE 5 ==========
    export function c5(a: number): number {
        for (let i = 0; i < a; i++) {}
        return 0;
    } 

    // ========== CASE 6 ==========
    export function c6(a: number): number {
        while (a > 0) a--;
        return 0;
    } 

    // ========== CASE 7 ==========
    export function c7(a: number): number {
        if (a > 0) {
            for (let i = 0; i < a; i++) {}
        }
        return 0;
    } 

    // ========== CASE 8 ==========
    export function c8(x: number): number {
        switch (x) {
            case 1: return 1;
            case 2: return 2;
            default: return 0;
        }
    } 

    // ========== CASE 9 ==========
    export function c9(a: number): number {
        return (a > 0) ? 1 : 0;
    } 

    // ========== CASE 10 ==========
    export function c10(a: number): number {
        return (a > 0) ? (a > 10 ? 2 : 1) : 0;
    } 

    // ========== CASE 11 ==========
    export function c11(a: number, b: number, c: number): number {
        if (a > 0)
            if (b > 0)
                if (c > 0)
                    return 1;
        return 0;
    } 

    // ========== CASE 12 ==========
    export function c12(x: number): number {
        if (x > 0) return 1;
        else if (x < 0) return -1;
        else return 0;
    } 

    // ========== CASE 13 ==========
    export function c13(a: number): number {
        if (a > 0) {
            while (a > 0) a--;
        }
        return 0;
    } 

    // ========== CASE 14 ==========
    export function c14(x: number): number {
        if (x > 0) {
            switch (x) {
                case 1: return 1;
                default: return 0;
            }
        }
        return -1;
    } 

    // ========== CASE 15 ==========
    export function c15(a: number): number {
        if (a > 0) {}
        if (a > 10) {}
        if (a > 20) {}
        return 0;
    } 

    // ========== CASE 16 ==========
    export function c16(a: number): number {
        for (let i = 0; i < 10; i++) {
            if (i > 5) return i;
        }
        return 0;
    } 

    // ========== CASE 17 ==========
    export function c17(a: number): number {
        while (a-- > 0) {
            if (a === 5) break;
        }
        return 0;
    } 

    // ========== CASE 18 ==========
    export function c18(a: number): number {
        return (a > 0) ? (a > 10 ? 1 : 0) : -1;
    } 

    // ========== CASE 19 ==========
    export function c19(a: number): number {
        return (a > 0) ? (a > 5 ? (a > 10 ? 3 : 2) : 1) : 0;
    } 

    // ========== CASE 20 ==========
    export function c20(a: number): number {
        if (a > 0) {
            if (a > 10) {
                if (a > 20) {
                    return 1;
                }
            }
        }
        return 0;
    } 

    // ========== CASE 21 ==========
    export function c21(a: number): number {
        for (let i = 0; i < a; i++) {
            while (i > 0) {
                if (i % 2 === 0) return i;
                break;
            }
        }
        return 0;
    } 

    // ========== CASE 22 ==========
    export function c22(a: number): number {
        if (a > 0 && a < 10) return 1;
        return 0;
    } 

    // ========== CASE 23 ==========
    export function c23(a: number): number {
        if (a > 0 || a < 0) return 1;
        return 0;
    } 

    // ========== CASE 24 ==========
    export function c24(a: number): number {
        if (a > 0) {
            if (a < 10) {
                if (a === 5) {
                    return 1;
                }
            }
        }
        return 0;
    } 

    // ========== CASE 25 ==========
    export function c25(x: number): number {
        switch (x) {
            case 1:
            case 2:
            case 3:
                return 1;
            default:
                return 0;
        }
    } 

    // ========== CASE 26 ==========
    export function c26(a: number): number {
        if (a > 0) return 1;
        if (a > 1) return 2;
        if (a > 2) return 3;
        if (a > 3) return 4;
        return 0;
    } 

    // ========== CASE 27 ==========
    export function c27(a: number): number {
        while (a > 0) {
            while (a > 10) {
                if (a === 5) return 1;
                break;
            }
            break;
        }
        return 0;
    } 

    // ========== CASE 28 ==========
    export function c28(a: number): number {
        if (a > 0 ? a > 10 : a < 10) return 1;
        return 0;
    } 

    // ========== CASE 29 ==========
    export function c29(a: number): number {
        for (let i = 0; i < a; i++) {
            for (let j = 0; j < i; j++) {
                if (j % 2 === 0) return j;
            }
        }
        return 0;
    } 

    // ========== CASE 30 ==========
    export function c30(a: number, b: number): number {
        return (a > b) ? a :
               (a < b) ? b :
               (a === b) ? 0 : -1;
    } 

    // ========== CASE 31 ==========
    export function c31(a: number, b: number, c: number): number {
        let x = 0;

        if (a > 0) x++;
        if (b > 0) x++;
        if (c > 0) x++;

        for (let i = 0; i < a; i++) {
            if (i % 2 === 0) x++;
        }

        while (b > 0) {
            if (b % 2 === 0) x++;
            b--;
        }

        switch (c) {
            case 1: x++; break;
            case 2: x++; break;
            case 3: x++; break;
            case 4: x++; break;
            case 5: x++; break;
        }

        x = (x > 10) ? x : 10;

        return x;
    }

    // ========== CASE 32 ==========
    export function c32(a: number, b: number, c: number): number {
        let x = 0;

        if (a > 0) x++;
        if (a > 10) x++;
        if (a > 20) x++;
        if (a > 30) x++;
        if (a > 40) x++;

        for (let i = 0; i < a; i++) {
            if (i % 2 === 0) x++;
            if (i % 3 === 0) x++;
        }

        while (b > 0) {
            if (b % 2 === 0) {
                x++;
            } else {
                x--;
            }

            if (b % 3 === 0) x++;

            b--;
        }

        switch (c) {
            case 1: x++; break;
            case 2: x++; break;
            case 3: x++; break;
            case 4: x++; break;
            case 5: x++; break;
            case 6: x++; break;
            case 7: x++; break;
            case 8: x++; break;
        }

        x = (x > 50) ? 50 : x;
        x = (x < 0) ? 0 : x;

        return x;
    }
}