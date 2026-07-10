import os
import glob

replacements = {
    'background-color: #f2f3f3;': 'background-color: var(--bg-primary);',
    'background-color: #fff;': 'background-color: var(--bg-surface);',
    'background: #fff;': 'background: var(--bg-surface);',
    'background-color: #f9f9f9;': 'background-color: var(--bg-surface-hover);',
    'background-color: #f2f8fd;': 'background-color: var(--bg-surface-active);',
    'background-color: #ec7211;': 'background-color: var(--brand-orange);',
    'background-color: #eb5f07;': 'background-color: var(--brand-orange-hover);',
    'background-color: #d13212;': 'background-color: var(--danger);',
    'background-color: #a0250d;': 'background-color: var(--danger-hover);',
    'background-color: #fceceb;': 'background-color: var(--error-bg);',
    'background-color: #232f3e;': 'background-color: var(--sidebar-bg);',
    'color: #16191f;': 'color: var(--text-primary);',
    'color: #545b64;': 'color: var(--text-secondary);',
    'color: #0073bb;': 'color: var(--link-color);',
    'color: #005282;': 'color: var(--link-hover);',
    'color: #ec7211;': 'color: var(--brand-orange);',
    'color: #d13212;': 'color: var(--danger);',
    'color: #a0250d;': 'color: var(--danger-hover);',
    'color: #d5dbdb;': 'color: var(--sidebar-text);',
    'color: #fff;': 'color: #fff; /* Keep as is for buttons, variables handle text */',
    'border: 1px solid #eaeded;': 'border: 1px solid var(--border-color);',
    'border: 1px solid #aab7b8;': 'border: 1px solid var(--border-color-strong);',
    'border: 1px solid #ec7211;': 'border: 1px solid var(--brand-orange);',
    'border: 1px solid #d13212;': 'border: 1px solid var(--danger);',
    'border: 1px solid #d5dbdb;': 'border: 1px solid var(--border-color-strong);',
    'border-bottom: 1px solid #eaeded;': 'border-bottom: 1px solid var(--border-color);',
    'border-top: 1px solid #eaeded;': 'border-top: 1px solid var(--border-color);',
    'border-left: 4px solid #d13212;': 'border-left: 4px solid var(--danger);',
    'border-color: #0073bb;': 'border-color: var(--link-color);',
    'box-shadow: 0 0 0 1px #0073bb;': 'box-shadow: 0 0 0 1px var(--link-color);',
    'box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);': 'box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);',
    'box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);': 'box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);',
    'box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);': 'box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);'
}

css_files = glob.glob('src/**/*.module.css', recursive=True)
for file in css_files:
    with open(file, 'r') as f:
        content = f.read()
    
    # Specific targeted replaces first
    content = content.replace('background-color: #16191f;', 'background-color: var(--sidebar-active);')
    content = content.replace('color: #fff;', 'color: var(--sidebar-text-active);') # In sidebar context this is good, otherwise we fix manually.

    for k, v in replacements.items():
        content = content.replace(k, v)
        
    with open(file, 'w') as f:
        f.write(content)
        
print("Replaced CSS vars in", len(css_files), "files")
