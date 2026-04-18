/**
 * Cyclomatic Complexity Test Suite (JavaScript)
 * Converted from mixed C/Java version
 */

// ========== CASE 1 ==========
function c1() {
    return 0;
} 

// ========== CASE 2 ==========
function c2(a) {
    if (a > 0) return 1;
    return 0;
} 

// ========== CASE 3 ==========
function c3(a) {
    if (a > 0) {}
    else {}
    return 0;
} 

// ========== CASE 4 ==========
function c4(a, b) {
    if (a > 0) return 1;
    if (b > 0) return 2;
    return 0;
} 

// ========== CASE 5 ==========
function c5(a) {
    for (let i = 0; i < a; i++) {}
    return 0;
} 

// ========== CASE 6 ==========
function c6(a) {
    while (a > 0) a--;
    return 0;
} 

// ========== CASE 7 ==========
function c7(a) {
    if (a > 0) {
        for (let i = 0; i < a; i++) {}
    }
    return 0;
} 

// ========== CASE 8 ==========
function c8(x) {
    switch (x) {
        case 1: return 1;
        case 2: return 2;
        default: return 0;
    }
} 

// ========== CASE 9 ==========
function c9(a) {
    return (a > 0) ? 1 : 0;
} 

// ========== CASE 10 ==========
function c10(a) {
    return (a > 0) ? (a > 10 ? 2 : 1) : 0;
} 

// ========== CASE 11 ==========
function c11(a, b, c) {
    if (a > 0)
        if (b > 0)
            if (c > 0)
                return 1;
    return 0;
} 

// ========== CASE 12 ==========
function c12(x) {
    if (x > 0) return 1;
    else if (x < 0) return -1;
    else return 0;
} 

// ========== CASE 13 ==========
function c13(a) {
    if (a > 0) {
        while (a > 0) a--;
    }
    return 0;
} 

// ========== CASE 14 ==========
function c14(x) {
    if (x > 0) {
        switch (x) {
            case 1: return 1;
            default: return 0;
        }
    }
    return -1;
} 

// ========== CASE 15 ==========
function c15(a) {
    if (a > 0) {}
    if (a > 10) {}
    if (a > 20) {}
    return 0;
} 

// ========== CASE 16 ==========
function c16(a) {
    for (let i = 0; i < 10; i++) {
        if (i > 5) return i;
    }
    return 0;
} 

// ========== CASE 17 ==========
function c17(a) {
    while (a-- > 0) {
        if (a === 5) break;
    }
    return 0;
} 

// ========== CASE 18 ==========
function c18(a) {
    return (a > 0) ? (a > 10 ? 1 : 0) : -1;
} 

// ========== CASE 19 ==========
function c19(a) {
    return (a > 0) ? (a > 5 ? (a > 10 ? 3 : 2) : 1) : 0;
} 

// ========== CASE 20 ==========
function c20(a) {
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
function c21(a) {
    for (let i = 0; i < a; i++) {
        while (i > 0) {
            if (i % 2 === 0) return i;
            break;
        }
    }
    return 0;
} 

// ========== CASE 22 ==========
function c22(a) {
    if (a > 0 && a < 10) return 1;
    return 0;
} 

// ========== CASE 23 ==========
function c23(a) {
    if (a > 0 || a < 0) return 1;
    return 0;
} 

// ========== CASE 24 ==========
function c24(a) {
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
function c25(x) {
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
function c26(a) {
    if (a > 0) return 1;
    if (a > 1) return 2;
    if (a > 2) return 3;
    if (a > 3) return 4;
    return 0;
} 

// ========== CASE 27 ==========
function c27(a) {
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
function c28(a) {
    if (a > 0 ? a > 10 : a < 10) return 1;
    return 0;
} 

// ========== CASE 29 ==========
function c29(a) {
    for (let i = 0; i < a; i++) {
        for (let j = 0; j < i; j++) {
            if (j % 2 === 0) return j;
        }
    }
    return 0;
} 

// ========== CASE 30 ==========
function c30(a, b) {
    return (a > b) ? a :
           (a < b) ? b :
           (a === b) ? 0 : -1;
} 

// ========== CASE 31 ==========
function c31(a, b, c) {
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
function c32(a, b, c) {
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