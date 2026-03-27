import re

editor_path = 'src/components/admin/RichTextEditor.tsx'
with open(editor_path, 'r') as f:
    content = f.read()

# Add immediatelyRender: false to useEditor
if 'immediatelyRender: false' not in content:
    content = content.replace('const editor = useEditor({', 'const editor = useEditor({\n    immediatelyRender: false,')
    
    with open(editor_path, 'w') as f:
        f.write(content)
