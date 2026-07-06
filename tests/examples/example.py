"""
Cyclomatic Complexity Test Suite (Python)
Converted from mixed C/Java/JavaScript version
"""

# ========== CASE 1 ==========
def c1():
    return 0


# ========== CASE 2 ==========
def c2(a):
    if a > 0:
        return 1
    return 0


# ========== CASE 3 ==========
def c3(a):
    if a > 0:
        pass
    else:
        pass
    return 0


# ========== CASE 4 ==========
def c4(a, b):
    if a > 0:
        return 1
    if b > 0:
        return 2
    return 0


# ========== CASE 5 ==========
def c5(a):
    for i in range(a):
        pass
    return 0


# ========== CASE 6 ==========
def c6(a):
    while a > 0:
        a -= 1
    return 0


# ========== CASE 7 ==========
def c7(a):
    if a > 0:
        for i in range(a):
            pass
    return 0


# ========== CASE 8 ==========
def c8(x):
    if x == 1:
        return 1
    elif x == 2:
        return 2
    else:
        return 0

# ========== CASE 9 ==========
def c9(a):
    return 1 if a > 0 else 0


# ========== CASE 10 ==========
def c10(a):
    return 2 if a > 10 else 1 if a > 0 else 0


# ========== CASE 11 ==========
def c11(a, b, c):
    if a > 0:
        if b > 0:
            if c > 0:
                return 1
    return 0


# ========== CASE 12 ==========
def c12(x):
    if x > 0:
        return 1
    elif x < 0:
        return -1
    else:
        return 0


# ========== CASE 13 ==========
def c13(a):
    if a > 0:
        while a > 0:
            a -= 1
    return 0


# ========== CASE 14 ==========
def c14(x):
    if x > 0:
        if x == 1:
            return 1
        else:
            return 0
    return -1


# ========== CASE 15 ==========
def c15(a):
    if a > 0:
        pass
    if a > 10:
        pass
    if a > 20:
        pass
    return 0


# ========== CASE 16 ==========
def c16(a):
    for i in range(10):
        if i > 5:
            return i
    return 0


# ========== CASE 17 ==========
def c17(a):
    while a > 0:
        a -= 1
        if a == 5:
            break
    return 0


# ========== CASE 18 ==========
def c18(a):
    return 1 if a > 10 else 0 if a > 0 else -1


# ========== CASE 19 ==========
def c19(a):
    return 3 if a > 10 else 2 if a > 5 else 1 if a > 0 else 0


# ========== CASE 20 ==========
def c20(a):
    if a > 0:
        if a > 10:
            if a > 20:
                return 1
    return 0


# ========== CASE 21 ==========
def c21(a):
    for i in range(a):
        while i > 0:
            if i % 2 == 0:
                return i
            break
    return 0


# ========== CASE 22 ==========
def c22(a):
    if a > 0 and a < 10:
        return 1
    return 0


# ========== CASE 23 ==========
def c23(a):
    if a > 0 or a < 0:
        return 1
    return 0


# ========== CASE 24 ==========
def c24(a):
    if a > 0:
        if a < 10:
            if a == 5:
                return 1
    return 0


# ========== CASE 25 ==========
def c25(x):
    if x == 1 or x == 2 or x == 3:
        return 1
    else:
        return 0


# ========== CASE 26 ==========
def c26(a):
    if a > 0:
        return 1
    if a > 1:
        return 2
    if a > 2:
        return 3
    if a > 3:
        return 4
    return 0


# ========== CASE 27 ==========
def c27(a):
    while a > 0:
        while a > 10:
            if a == 5:
                return 1
            break
        break
    return 0


# ========== CASE 28 ==========
def c28(a):
    if (a > 10 if a > 0 else a < 10):
        return 1
    return 0


# ========== CASE 29 ==========
def c29(a):
    for i in range(a):
        for j in range(i):
            if j % 2 == 0:
                return j
    return 0


# ========== CASE 30 ==========
def c30(a, b):
    return a if a > b else b if a < b else 0 if a == b else -1


# ========== CASE 31 ==========
def c31(a, b, c):
    x = 0

    if a > 0:
        x += 1
    if b > 0:
        x += 1
    if c > 0:
        x += 1

    for i in range(a):
        if i % 2 == 0:
            x += 1

    while b > 0:
        if b % 2 == 0:
            x += 1
        b -= 1

    if c == 1:
        x += 1
    elif c == 2:
        x += 1
    elif c == 3:
        x += 1
    elif c == 4:
        x += 1
    elif c == 5:
        x += 1

    x = x if x > 10 else 10

    return x

# ========== CASE 32 ==========
def c32(a, b, c):
    x = 0

    if a > 0:
        x += 1
    if a > 10:
        x += 1
    if a > 20:
        x += 1
    if a > 30:
        x += 1
    if a > 40:
        x += 1

    for i in range(a):
        if i % 2 == 0:
            x += 1
        if i % 3 == 0:
            x += 1

    while b > 0:
        if b % 2 == 0:
            x += 1
        else:
            x -= 1

        if b % 3 == 0:
            x += 1

        b -= 1

    if c == 1:
        x += 1
    elif c == 2:
        x += 1
    elif c == 3:
        x += 1
    elif c == 4:
        x += 1
    elif c == 5:
        x += 1
    elif c == 6:
        x += 1
    elif c == 7:
        x += 1
    elif c == 8:
        x += 1

    x = 50 if x > 50 else x
    x = 0 if x < 0 else x

    return x

# ========== CASE 33 ==========
def c33(x):
    if x == 1 or x == 2 or x == 3:
        return 1
    else:
        return 0