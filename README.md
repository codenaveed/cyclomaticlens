# Cyclomatic Complexity Analyzer VS Code Extension

A Visual Studio Code extension that computes cyclomatic complexity for C and Java code, highlighting complexity directly in the editor.

## Features

- **Multi-language support**: C, C++, Java
- **Cyclomatic complexity calculation**: Computes McCabe's cyclomatic complexity for functions/methods
- **Inline code highlighting**: Shows complexity scores directly in the editor
- **Real-time analysis**: Updates as you type (with debouncing)
- **Complexity thresholds**: Configurable warning levels with color coding

## Prerequisites
- VS Code 1.60 or higher
- Node.js 16+ and npm (for building and testing)
- Python 3.8+ (for running the build script)

## Installation

1. Build the VSIX package:
   ```bash
   cd extension
   python build_vsix.py
   ```

2. Install in VS Code:
   - Open VS Code
   - Go to Extensions view (Ctrl+Shift+X)
   - Click "..." menu → "Install from VSIX..."
   - Select the `.vsix` file from the `bin/` folder
      
   Or use the command line:
   ```bash
   code --install-extension bin/*.vsix
   ```

## Usage

1. Open a C, C++, or Java file in VS Code
2. Complexity scores will automatically appear inline next to each function
3. Scores are color-coded:
   - Green (≤10): Low complexity
   - Yellow (11-15): Medium complexity  
   - Orange (16-20): High complexity
   - Red (>20): High risk complexity

## Configuration

The extension can be configured via VS Code settings:
- `cyclomaticComplexity.threshold`: Warning threshold (default: 10)

## Development

### Project Structure
```
cyclomaticlens
├── extension/            # VS Code extension files
│   └── build_vsix.py     # Build script (Python)
│   └── core.js           # Core implementation of anlyzer
│   └── extension.js      # Pure JavaScript implementation
│   ├── package.json      # Extension manifest
│   └── CHANGELOG.md      # Change history
│   └── README.md         # Feature detail
│   └── CyclomaticLens.png # Icon
├── tests/                # Test related
│   └── examples          # Demo language files
│   └── scripts           # Test scripts
│       └── ccm.test.js   # Test
└── README.md             # This file
```
### Testing
The test suite focuses on verifying CCM computation works correctly, not VS Code behavior.

1. Install test dependencies (only in the tests folder):
   ```bash
   cd tests
   npm install
   ```

2. Run the test suite with Jest:
   ```bash
   npm test
   ```

### Building
```bash
cd extension
python build_vsix.py
```

## Preprocessor Directive Handling

For C/C++ code with preprocessor directives, the cyclomatic complexity calculation follows these rules:

1. **`#if`/`#elif`/`#else` chains**: Count +1 (only one branch is active in the chain)
2. **`#ifdef`/`#elif`/`#else` chains**: Count +1 (only one branch is active in the chain)  
3. **Independent `#ifdef X` blocks**: Count +1 each (we're not sure about macro value so we consider it as active)
4. **Independent `#ifndef X` blocks**: Count +1 each (we're not sure about macro value so we consider it as active)

These rules ensure consistent complexity calculation regardless of preprocessor macro definitions.

## Notes

- This is a pure JavaScript implementation with no Python dependencies
- Supports C, C++, and Java files
- Provides real-time inline complexity analysis
- Simple and lightweight

## License

MIT
