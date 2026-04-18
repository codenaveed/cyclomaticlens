#!/usr/bin/env python3
"""Build script for creating VSIX package for Cyclomatic Complexity Analyzer extension."""

import os
import sys
import subprocess
import shutil
import json
from pathlib import Path

# Add Homebrew paths to environment for subprocess calls
HOMEBREW_PATH = "/opt/homebrew/bin"
if HOMEBREW_PATH not in os.environ.get('PATH', ''):
    os.environ['PATH'] = f"{HOMEBREW_PATH}:{os.environ.get('PATH', '')}"


def check_dependencies():
    """Check if required dependencies are installed."""
    print("Checking dependencies...")
    
    # Check if vsce is installed
    try:
        subprocess.run(['vsce', '--version'], capture_output=True, check=True)
        print("✓ vsce (Visual Studio Code Extension Manager) is installed")
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("✗ vsce is not installed. Installing...")
        try:
            subprocess.run(['npm', 'install', '-g', '@vscode/vsce'], check=True)
            print("✓ vsce installed successfully")
        except subprocess.CalledProcessError as e:
            print(f"✗ Failed to install vsce: {e}")
            return False
    
    # Check if npm is installed
    try:
        subprocess.run(['npm', '--version'], capture_output=True, check=True)
        print("✓ npm is installed")
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("✗ npm is not installed. Please install Node.js and npm.")
        return False
    
    return True


def prepare_extension_directory():
    """Prepare the extension directory for packaging."""
    print("\nPreparing extension directory...")
    
    extension_dir = Path(".")
    
    # Note: python_analyzer directory has been removed
    # The extension now uses pure JavaScript implementation
    
    print("  ✓ Extension directory prepared (pure JavaScript implementation)")
    
    return True




def update_package_json():
    """Update package.json with build information."""
    print("\nUpdating package.json...")
    
    package_json_path = Path("package.json")
    
    with open(package_json_path, 'r') as f:
        package_data = json.load(f)
    
    # Update version if needed
    if 'version' not in package_data:
        package_data['version'] = '1.0.0'
    
    # Add scripts section if not present
    if 'scripts' not in package_data:
        package_data['scripts'] = {}
    
    package_data['scripts']['package'] = 'vsce package'
    
    with open(package_json_path, 'w') as f:
        json.dump(package_data, f, indent=2)
    
    print("✓ Updated package.json")


def build_vsix():
    """Build the VSIX package."""
    print("\nBuilding VSIX package...")
    
    # Read version from package.json
    package_json_path = Path("package.json")
    with open(package_json_path, 'r') as f:
        package_data = json.load(f)
    version = package_data.get('version', '1.0.0')
    
    # Create bin directory if it doesn't exist
    bin_dir = Path("..") / "bin"
    try:
        bin_dir.mkdir(exist_ok=True)
        print(f"  ✓ Bin directory: {bin_dir.absolute()}")
    except Exception as e:
        print(f"✗ Failed to create bin directory: {e}")
        return False
    
    # Determine output filename with version
    output_filename = f"cyclomatic-complexity-analyzer-{version}.vsix"
    output_path = bin_dir / output_filename
    
    # Check if file already exists and remove it
    if output_path.exists():
        print(f"  ⚠ Existing VSIX file found: {output_filename}")
        try:
            output_path.unlink()
            print(f"  ✓ Removed existing VSIX file")
        except Exception as e:
            print(f"✗ Failed to remove existing VSIX file: {e}")
            return False
    
    try:
        # The output path is relative to the current directory (extension folder)
        relative_output_path = Path("..") / "bin" / output_filename
        
        # Run vsce package command with output directory
        print(f"  Running: vsce package -o {relative_output_path}")
        result = subprocess.run(
            ['vsce', 'package', '-o', str(relative_output_path)],
            capture_output=True,
            text=True,
            check=True
        )
        
        if result.stdout:
            print("  Output:", result.stdout.strip())
        
        if result.stderr:
            print("  Errors:", result.stderr.strip())
        
        # Check if the file was created
        if output_path.exists():
            file_size = output_path.stat().st_size
            print(f"\n✓ VSIX package created: {output_path} ({file_size} bytes)")
            return True
        else:
            print("✗ No VSIX file was created")
            return False
            
    except subprocess.CalledProcessError as e:
        print(f"✗ Failed to build VSIX package: {e}")
        if e.stderr:
            print("Error output:", e.stderr.strip())
        return False
    except Exception as e:
        print(f"✗ Unexpected error: {e}")
        return False


# Removed create_install_script() function - auto-install feature no longer supported


def main():
    """Main build function."""
    print("=" * 60)
    print("Cyclomatic Complexity Analyzer VSIX Builder")
    print("=" * 60)
    
    # Check dependencies
    if not check_dependencies():
        print("\n✗ Dependencies check failed. Please install required tools.")
        return 1
    
    # Prepare extension directory
    if not prepare_extension_directory():
        print("\n✗ Failed to prepare extension directory.")
        return 1
    
    # Update package.json
    update_package_json()
    
    # Build VSIX
    if not build_vsix():
        print("\n✗ Failed to build VSIX package.")
        return 1
    
    print("\n" + "=" * 60)
    print("BUILD COMPLETE!")
    print("=" * 60)
    print("\nNext steps:")
    print("1. Install the .vsix file from the bin/ folder:")
    print("   - Open VS Code")
    print("   - Go to Extensions view (Ctrl+Shift+X)")
    print("   - Click '...' menu → 'Install from VSIX...'")
    print("   - Select the .vsix file from the bin/ folder")
    print("2. Or use command line: code --install-extension bin/*.vsix")
    print("3. Open VS Code and test with C, C++, or Java files")
    print("\nThe extension provides:")
    print("• Cyclomatic complexity analysis for C, C++, Java")
    print("• Visual highlighting of complex code")
    print("• Output panel with detailed results")
    print("• Configurable complexity thresholds")
    print("\nFor more information, see README.md")
    
    return 0


if __name__ == "__main__":
    sys.exit(main())