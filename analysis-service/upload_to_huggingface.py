#!/usr/bin/env python3
"""
Script to upload analysis-service to Hugging Face Spaces.
Run this script after logging in with: huggingface-cli login
"""

import os
import sys
from huggingface_hub import HfApi, create_repo, upload_folder, login

# Configuration
SPACE_NAME = "agripredict-analysis"  # Will be: username/agripredict-analysis
REPO_TYPE = "space"
SPACE_SDK = "docker"  # Using Docker for FastAPI

def main():
    # Check if logged in
    api = HfApi()
    
    try:
        user_info = api.whoami()
        username = user_info.get("name", user_info.get("username"))
        print(f"✓ Logged in as: {username}")
    except Exception as e:
        print("✗ Not logged in to Hugging Face.")
        print("\nPlease login first:")
        print("  Option 1: Run this script with HF_TOKEN environment variable")
        print("  Option 2: Login interactively")
        
        token = input("\nEnter your Hugging Face token (or press Enter to cancel): ").strip()
        if not token:
            print("Cancelled.")
            sys.exit(1)
        
        login(token=token, add_to_git_credential=True)
        user_info = api.whoami()
        username = user_info.get("name", user_info.get("username"))
        print(f"✓ Logged in as: {username}")
    
    repo_id = f"{username}/{SPACE_NAME}"
    print(f"\n📦 Creating/updating Space: {repo_id}")
    
    # Create the repo if it doesn't exist
    try:
        create_repo(
            repo_id=repo_id,
            repo_type=REPO_TYPE,
            space_sdk=SPACE_SDK,
            exist_ok=True,
            private=False
        )
        print(f"✓ Space created/verified: https://huggingface.co/spaces/{repo_id}")
    except Exception as e:
        print(f"✗ Error creating repo: {e}")
        sys.exit(1)
    
    # Get the directory of this script (analysis-service folder)
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Files to ignore during upload
    ignore_patterns = [
        "__pycache__",
        "*.pyc",
        ".git",
        "venv",
        ".env",
        "*.log",
        "upload_to_huggingface.py",  # Don't upload this script
    ]
    
    print(f"\n📤 Uploading files from: {script_dir}")
    print(f"   Ignoring: {ignore_patterns}")
    
    try:
        upload_folder(
            repo_id=repo_id,
            folder_path=script_dir,
            repo_type=REPO_TYPE,
            ignore_patterns=ignore_patterns,
            commit_message="Update AgriPredict Analysis Service",
        )
        print(f"\n✓ Upload complete!")
        print(f"\n🚀 Your Space is available at:")
        print(f"   https://huggingface.co/spaces/{repo_id}")
        print(f"\n   It may take a few minutes to build and deploy.")
    except Exception as e:
        print(f"✗ Upload failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
