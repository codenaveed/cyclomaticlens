/**
 * Simple util.
 */
function simple(): number {
    return 1;
}

/**
 * Complex logic.
 */
function heavy(x: number): number {
    if (x) { x++; } if (x) { x++; } if (x) { x++; }
    if (x) { x++; } if (x) { x++; } if (x) { x++; }
    if (x) { x++; } if (x) { x++; } if (x) { x++; }
    if (x) { x++; } if (x) { x++; } if (x) { x++; }
    return x;
}
