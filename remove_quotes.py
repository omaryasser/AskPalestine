#!/usr/bin/env python3

import os
import re

def remove_quote_markers():
    """
    Remove > quote markers from all markdown files in the questions/answers directories.
    """
    
    questions_dir = './data/questions'
    
    if not os.path.exists(questions_dir):
        print(f"Questions directory not found: {questions_dir}")
        return
    
    total_files_processed = 0
    total_lines_changed = 0
    
    # Walk through all directories
    for root, dirs, files in os.walk(questions_dir):
        for file in files:
            if file.endswith('.md'):
                file_path = os.path.join(root, file)
                
                try:
                    # Read the file
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    # Split into lines
                    lines = content.split('\n')
                    modified_lines = []
                    file_changed = False
                    lines_changed_in_file = 0
                    
                    for line in lines:
                        # Remove quote markers at the beginning of lines
                        if line.startswith('> '):
                            # Remove "> " from the beginning
                            modified_line = line[2:]
                            modified_lines.append(modified_line)
                            file_changed = True
                            lines_changed_in_file += 1
                        elif line.startswith('>'):
                            # Remove ">" from the beginning if no space after
                            modified_line = line[1:]
                            modified_lines.append(modified_line)
                            file_changed = True
                            lines_changed_in_file += 1
                        else:
                            modified_lines.append(line)
                    
                    # Write back if changed
                    if file_changed:
                        with open(file_path, 'w', encoding='utf-8') as f:
                            f.write('\n'.join(modified_lines))
                        
                        total_files_processed += 1
                        total_lines_changed += lines_changed_in_file
                        print(f"  ✓ {file_path} - removed quotes from {lines_changed_in_file} lines")
                
                except Exception as e:
                    print(f"  ERROR processing {file_path}: {e}")
    
    print(f"\nCompleted! Processed {total_files_processed} files, removed quotes from {total_lines_changed} lines total.")

if __name__ == "__main__":
    remove_quote_markers()
