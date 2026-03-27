import os
import re

# We need to add the write token to Sanity client for mutations to work locally if not authenticated correctly
# or fix the dataset if the user's project has a different default dataset name.

# Let's check the schema files to see if there's any tricky validation
author_path = 'sanity/schemas/author.ts'
article_path = 'sanity/schemas/article.ts'

if os.path.exists(author_path):
    with open(author_path, 'r') as f:
        print("--- author.ts ---")
        print(f.read())

if os.path.exists(article_path):
    with open(article_path, 'r') as f:
        print("\n--- article.ts ---")
        print(f.read())
