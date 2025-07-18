#!/usr/bin/env python3
"""
Enhanced script to standardize markdown formatting in the data folder.
- Replace excessive empty lines with single empty lines
- Add > prefix for quotes (content after introduction)
- Remove trailing and starting empty lines
- Keep consistent formatting
- Preserve existing > quotation format
"""

import os
import re
from pathlib import Path

def standardize_markdown_format(content):
    """Standardize markdown file formatting"""
    
    # Split into lines
    lines = content.split('\n')
    
    # Remove leading empty lines
    while lines and lines[0].strip() == '':
        lines.pop(0)
    
    # Remove trailing empty lines
    while lines and lines[-1].strip() == '':
        lines.pop()
    
    if not lines:
        return ""
    
    # Find the first line (usually the introduction)
    # and separate it from the quote content
    result_lines = []
    
    # Process line by line
    i = 0
    while i < len(lines):
        line = lines[i]
        
        # Add the current line
        result_lines.append(line)
        
        # Look ahead for multiple empty lines and replace with single empty line
        empty_count = 0
        j = i + 1
        while j < len(lines) and lines[j].strip() == '':
            empty_count += 1
            j += 1
        
        # If we found multiple empty lines, add only one
        if empty_count > 1:
            result_lines.append('')
            i = j
        elif empty_count == 1:
            result_lines.append('')
            i = j
        else:
            i += 1
    
    # Now process the content to add quote formatting
    # Look for pattern: introduction line, empty line, then content
    final_lines = []
    
    for i, line in enumerate(result_lines):
        if i == 0:
            # First line is always kept as is (introduction)
            final_lines.append(line)
        elif line.strip() == '':
            # Empty lines are kept
            final_lines.append(line)
        else:
            # For non-empty lines after the first line
            # Check if it's already a quote (starts with >)
            if line.strip().startswith('>'):
                final_lines.append(line)
            else:
                # Check if this is likely a quote (not a heading, link, or source)
                if not (line.startswith('#') or 
                       line.startswith('[') or 
                       line.startswith('Source') or
                       line.startswith('@') or
                       line.startswith('**Source') or
                       line.strip().startswith('*')):
                    # Add quote formatting
                    final_lines.append(f'> {line}')
                else:
                    final_lines.append(line)
    
    # Join back
    result = '\n'.join(final_lines)
    
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
