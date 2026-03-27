import glob

def replace_in_file(path, old_strs, new_str):
    try:
        with open(path, 'r') as f:
            content = f.read()
        for old in old_strs:
            content = content.replace(old, new_str)
        with open(path, 'w') as f:
            f.write(content)
    except FileNotFoundError:
        pass

# Globals.css - make sure background and foreground variables are standard
with open('src/app/globals.css', 'r') as f:
    css = f.read()
css = css.replace('--color-background:   var(--color-surface);', '--color-background:   #ffffff;')
css = css.replace('--color-foreground:   var(--color-text);', '--color-foreground:   #0f172a;')
css = css.replace('--color-background: #0f172a;', '--color-background: #020617;') # darker for dark mode
css = css.replace('--color-foreground: #f1f5f9;', '--color-foreground: #f8fafc;')
with open('src/app/globals.css', 'w') as f:
    f.write(css)

# Layout
replace_in_file('src/app/layout.tsx', ['bg-[var(--color-background)] text-[var(--color-foreground)]'], 'bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50')

# Header
replace_in_file('src/components/SiteHeader.tsx', ['bg-white/90 dark:bg-slate-900/90'], 'bg-white/90 dark:bg-slate-950/90')

# Footer
replace_in_file('src/components/SiteFooter.tsx', ['bg-white dark:bg-slate-900'], 'bg-white dark:bg-slate-950')

# Now apply some cleanup to the main pages for better padding and contrast
