#!/usr/bin/env python3

import os
import json
import re

def migrate_questions():
    """
    Migrate questions from text.md files to metadata.json files.
    - Read the main question from text.md
    - Add it as the first element in other_question_forms array in metadata.json
    - Remove the text.md file
    """
    
    data_dir = './data/questions'
    
    if not os.path.exists(data_dir):
        print(f"Questions directory not found: {data_dir}")
        return
    
    question_dirs = [d for d in os.listdir(data_dir) if os.path.isdir(os.path.join(data_dir, d))]
    
    print(f"Found {len(question_dirs)} question directories")
    
    for question_dir in question_dirs:
        question_path = os.path.join(data_dir, question_dir)
        text_md_path = os.path.join(question_path, 'text.md')
        metadata_path = os.path.join(question_path, 'metadata.json')
        
        # Skip if text.md doesn't exist
        if not os.path.exists(text_md_path):
            print(f"  Skipping {question_dir} - no text.md file")
            continue
            
        # Read the question from text.md
        with open(text_md_path, 'r', encoding='utf-8') as f:
            content = f.read().strip()
        
        # Extract the main question (first line, ignoring any quoted lines that start with >)
        lines = [line.strip() for line in content.split('\n') if line.strip()]
        main_question = None
        
        for line in lines:
            if not line.startswith('>'):
                main_question = line
                break
        
        if not main_question:
            print(f"  WARNING: Could not find main question in {question_dir}")
            continue
        
        # Read or create metadata.json
        metadata = {"other_question_forms": []}
        if os.path.exists(metadata_path):
            try:
                with open(metadata_path, 'r', encoding='utf-8') as f:
                    metadata = json.load(f)
            except json.JSONDecodeError as e:
                print(f"  WARNING: Invalid JSON in {metadata_path}: {e}")
                metadata = {"other_question_forms": []}
        
        # Ensure other_question_forms exists and is a list
        if "other_question_forms" not in metadata:
            metadata["other_question_forms"] = []
        elif not isinstance(metadata["other_question_forms"], list):
            metadata["other_question_forms"] = []
        
        # Add the main question as the first element if it's not already there
        if main_question not in metadata["other_question_forms"]:
            metadata["other_question_forms"].insert(0, main_question)
        
        # Write updated metadata.json
        with open(metadata_path, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, indent=2, ensure_ascii=False)
        
        # Remove text.md file
        os.remove(text_md_path)
        
        print(f"  ✓ Migrated: {main_question}")
    
    print(f"\nMigration complete! Processed {len(question_dirs)} directories")

if __name__ == "__main__":
    migrate_questions()
