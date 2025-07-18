#!/usr/bin/env python3
"""
Script to standardize markdown formatting in the data folder.
- Replace &nbsp; with empty lines
- Remove trailing and starting empty lines
- Keep consistent formatting
- Preserve > quotation format
"""

import os
import re
from pathlib import Path

def standardize_markdown_format(content):
    """Standardize markdown file formatting"""
    
    # Split into lines
    lines = content.split('\n')
    
    # Replace &nbsp; lines with empty lines
    lines = ['' if line.strip() == '&nbsp;' else line for line in lines]
    
    # Remove leading empty lines
    while lines and lines[0].strip() == '':
        lines.pop(0)
    
    # Remove trailing empty lines
    while lines and lines[-1].strip() == '':
        lines.pop()
    
    # Join back
    result = '\n'.join(lines)
    
    # Ensure file ends with exactly one newline if it has content
    if result.strip():
        result = result.rstrip() + '\n'
    
    return result

def process_markdown_file(file_path):
    """Process a single markdown file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            original_content = f.read()
        
        standardized_content = standardize_markdown_format(original_content)
        
        # Only write if content changed
        if original_content != standardized_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(standardized_content)
            print(f"✓ Standardized: {file_path}")
            return True
        else:
            print(f"- No changes: {file_path}")
            return False
    except Exception as e:
        print(f"✗ Error processing {file_path}: {e}")
        return False

def main():
    """Main function to process all markdown files in data directory"""
    data_dir = Path(__file__).parent / 'data'
    
    if not data_dir.exists():
        print(f"Data directory not found: {data_dir}")
        return
    
    # Find all .md files recursively
    md_files = list(data_dir.rglob('*.md'))
    
    print(f"Found {len(md_files)} markdown files to process...")
    
    changed_count = 0
    for md_file in md_files:
        if process_markdown_file(md_file):
            changed_count += 1
    
    print(f"\nSummary: {changed_count} files were modified, {len(md_files) - changed_count} were already formatted correctly.")

if __name__ == "__main__":
    main()
