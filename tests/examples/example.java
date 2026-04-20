/**
 * File Description
 */
package com.mypackage.example;

import com.otherpackage.feature;

public class example {

    /**
     * Field defintioins 
     */
    public short field0;
    public short field1;

    
    // ========== CASE 1 ==========
    /**
     * Constructor Definition 
     * c1 is replaced with constructor in java
     */    
    public example() { 
        return 0; 
    } 

    // ========== CASE 2 ==========
    int c2(int a) {
        if (a > 0) return 1;
        return 0;
    } 

    // ========== CASE 3 ==========
    int c3(int a) {
        if (a > 0) {}
        else {}
        return 0;
    } 

    // ========== CASE 4 ==========
    int c4(int a, int b) {
        if (a > 0) return 1;
        if (b > 0) return 2;
        return 0;
    } 

    // ========== CASE 5 ==========
    int c5(int a) {
        for (int i = 0; i < a; i++) {}
        return 0;
    } 

    // ========== CASE 6 ==========
    int c6(int a) {
        while (a > 0) a--;
        return 0;
    } 

    // ========== CASE 7 ==========
    int c7(int a) {
        if (a > 0) {
            for (int i = 0; i < a; i++) {}
        }
        return 0;
    } 

    // ========== CASE 8 ==========
    int c8(int x) {
        switch (x) {
            case 1: return 1;
            case 2: return 2;
            default: return 0;
        }
    } 

    // ========== CASE 9 ==========
    int c9(int a) {
        return (a > 0) ? 1 : 0;
    } 

    // ========== CASE 10 ==========
    int c10(int a) {
        return (a > 0) ? (a > 10 ? 2 : 1) : 0;
    } 

    // ========== CASE 11 ==========
    int c11(int a, int b, int c) {
        if (a > 0)
            if (b > 0)
                if (c > 0)
                    return 1;
        return 0;
    } 

    // ========== CASE 12 ==========
    int c12(int x) {
        if (x > 0) return 1;
        else if (x < 0) return -1;
        else return 0;
    } 

    // ========== CASE 13 ==========
    int c13(int a) {
        if (a > 0) {
            while (a > 0) a--;
        }
        return 0;
    } 

    // ========== CASE 14 ==========
    int c14(int x) {
        if (x > 0) {
            switch (x) {
                case 1: return 1;
                default: return 0;
            }
        }
        return -1;
    } 

    // ========== CASE 15 ==========
    int c15(int a) {
        if (a > 0) {}
        if (a > 10) {}
        if (a > 20) {}
        return 0;
    } 

    // ========== CASE 16 ==========
    int c16(int a) {
        for (int i = 0; i < 10; i++) {
            if (i > 5) return i;
        }
        return 0;
    } 

    // ========== CASE 17 ==========
    int c17(int a) {
        while (a-- > 0) {
            if (a == 5) break;
        }
        return 0;
    } 

    // ========== CASE 18 ==========
    int c18(int a) {
        return (a > 0) ? (a > 10 ? 1 : 0) : -1;
    } 

    // ========== CASE 19 ==========
    int c19(int a) {
        return (a > 0) ? (a > 5 ? (a > 10 ? 3 : 2) : 1) : 0;
    } 

    // ========== CASE 20 ==========
    int c20(int a) {
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
    int c21(int a) {
        // dummy comment 1
        for (int i = 0; i < a; i++) {
            /**
             * dummy comment 2
             */
            while (i > 0) {
                if (i % 2 == 0) return i;
                // dummy comment 3
                break;
            }
        }
        return 0;
    } 

    // ========== CASE 22 ==========
    int c22(int a) {
        if (a > 0 && a < 10) return 1;
        return 0;
    }  

    // ========== CASE 23 ==========
    int c23(int a) {
        if (a > 0 || a < 0) return 1;
        return 0;
    } 

    // ========== CASE 24 ==========
    int c24(int a) {
        if (a > 0) {
            if (a < 10) {
                if (a == 5) {
                    return 1;
                }
            }
        }
        return 0;
    } 

    // ========== CASE 25 ==========
    int c25(int x) {
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
    int c26(int a) {
        if (a > 0) return 1;
        if (a > 1) return 2;
        if (a > 2) return 3;
        if (a > 3) return 4;
        return 0;
    } 

    // ========== CASE 27 ==========
    int c27(int a) {
        while (a > 0) {
            while (a > 10) {
                if (a == 5) return 1;
                break;
            }
            break;
        }
        return 0;
    } 

    // ========== CASE 28 ==========
    int c28(int a) {
        if (a > 0 ? a > 10 : a < 10) return 1;
        return 0;
    } 

    // ========== CASE 29 ==========
    int c29(int a) {
        for (int i = 0; i < a; i++) {
            for (int j = 0; j < i; j++) {
                if (j % 2 == 0) return j;
            }
        }
        return 0;
    } 

    // ========== CASE 30 ==========
    int c30(int a, int b) {
        return (a > b) ? a :
               (a < b) ? b :
               (a == b) ? 0 : -1;
    } 

    int c31(int a, int b, int c) {
        int x = 0;

        if (a > 0) x++;

        if (b > 0) x++;

        if (c > 0) x++;

        for (int i = 0; i < a; i++) {
            if (i % 2 == 0) {
                x++;
            }
        }

        while (b > 0) {
            if (b % 2 == 0) {
                x++;
            }
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

    int c32(int a, int b, int c) {
        int x = 0;

        if (a > 0) x++;
        if (a > 10) x++;
        if (a > 20) x++;
        if (a > 30) x++;
        if (a > 40) x++;

        for (int i = 0; i < a; i++) {
            if (i % 2 == 0) {
                x++;
            }
            if (i % 3 == 0) {
                x++;
            }
        }

        while (b > 0) {
            if (b % 2 == 0) {
                x++;
            } else {
                x--;
            }

            if (b % 3 == 0) {
                x++;
            }

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