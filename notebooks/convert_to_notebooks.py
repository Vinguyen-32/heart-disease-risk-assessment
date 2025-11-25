"""
Convert Python scripts to Jupyter notebooks
"""

import nbformat as nbf
from pathlib import Path

def python_to_notebook(py_file, output_file=None):
    """
    Convert a Python file to a Jupyter notebook

    Args:
        py_file: Path to Python file
        output_file: Path to output notebook (defaults to same name with .ipynb)
    """
    py_path = Path(py_file)

    if output_file is None:
        output_file = py_path.with_suffix('.ipynb')

    # Read Python file
    with open(py_path, 'r') as f:
        content = f.read()

    # Create new notebook
    nb = nbf.v4.new_notebook()

    # Split content into cells based on section markers
    lines = content.split('\n')

    current_cell = []
    cell_type = 'code'
    cells = []

    i = 0
    while i < len(lines):
        line = lines[i]

        # Check for triple-quoted docstrings at start (markdown)
        if i == 0 and line.strip().startswith('"""'):
            # Multiline docstring
            cell_type = 'markdown'
            i += 1
            while i < len(lines) and not lines[i].strip().endswith('"""'):
                current_cell.append(lines[i])
                i += 1
            if i < len(lines):
                i += 1  # Skip closing """

            # Add markdown cell
            if current_cell:
                cells.append(nbf.v4.new_markdown_cell('\n'.join(current_cell)))
                current_cell = []
            cell_type = 'code'
            continue

        # Check for section markers (===, ---, ###)
        if '=' * 50 in line or line.strip().startswith('# ======'):
            # Save previous code cell
            if current_cell:
                cells.append(nbf.v4.new_code_cell('\n'.join(current_cell)))
                current_cell = []

            # Look ahead for section title
            if i + 1 < len(lines):
                next_line = lines[i + 1].strip()
                if next_line.startswith('#') or next_line.startswith('print'):
                    # Extract title
                    if next_line.startswith('print'):
                        # Extract from print statement
                        title = next_line.replace('print(', '').replace('print("', '').replace('")', '').replace("')", '').strip()
                        if title and not title.startswith('='):
                            cells.append(nbf.v4.new_markdown_cell(f"## {title}"))
                    else:
                        # Regular comment
                        title = next_line.lstrip('#').strip()
                        if title:
                            cells.append(nbf.v4.new_markdown_cell(f"## {title}"))
                    i += 2  # Skip both separator and title lines
                    continue
            i += 1
            continue

        # Regular code line
        current_cell.append(line)
        i += 1

    # Add final cell
    if current_cell:
        cells.append(nbf.v4.new_code_cell('\n'.join(current_cell)))

    nb['cells'] = cells

    # Write notebook
    with open(output_file, 'w') as f:
        nbf.write(nb, f)

    print(f"✓ Converted {py_file} → {output_file}")
    return output_file


def main():
    """Convert all target Python files to notebooks"""

    print("="*70)
    print("Converting Python Scripts to Jupyter Notebooks")
    print("="*70)

    scripts = [
        'ordinal_classification.py',
        'phase1_improvements.py',
        'three_class_grouping.py'
    ]

    for script in scripts:
        try:
            python_to_notebook(script)
        except Exception as e:
            print(f"✗ Error converting {script}: {e}")

    print("\n" + "="*70)
    print("Conversion Complete")
    print("="*70)
    print("\nGenerated notebooks:")
    for script in scripts:
        notebook = script.replace('.py', '.ipynb')
        print(f"  - {notebook}")

    print("\nYou can now open these in Jupyter:")
    print("  jupyter notebook")


if __name__ == '__main__':
    main()
