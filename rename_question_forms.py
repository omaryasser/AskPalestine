#!/usr/bin/env python3

import os
import json

def rename_question_forms_field():
    questions_dir = "/Users/omar/Documents/askpalestine/v2/askpalestine/data/questions"
    
    for question_folder in os.listdir(questions_dir):
        question_path = os.path.join(questions_dir, question_folder)
        if not os.path.isdir(question_path):
            continue
            
        metadata_file = os.path.join(question_path, "metadata.json")
        if not os.path.exists(metadata_file):
            continue
            
        try:
            # Read metadata
            with open(metadata_file, 'r', encoding='utf-8') as f:
                metadata = json.load(f)
            
            # Rename the field if it exists
            if "other_question_forms" in metadata:
                metadata["question_forms"] = metadata.pop("other_question_forms")
                
                # Write back the updated metadata
                with open(metadata_file, 'w', encoding='utf-8') as f:
                    json.dump(metadata, f, indent=2, ensure_ascii=False)
                
                print(f"Updated: {question_folder}")
            else:
                print(f"No other_question_forms field in: {question_folder}")
                
        except Exception as e:
            print(f"Error processing {question_folder}: {e}")

if __name__ == "__main__":
    rename_question_forms_field()
    print("Field renaming completed!")
