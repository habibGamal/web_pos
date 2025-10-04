import xml.etree.ElementTree as ET
import re
from html import unescape

def parse_table_content(value_str):
    """Parse the HTML content from value attribute to extract table name and fields."""
    # Unescape HTML entities first
    content = unescape(value_str)
    
    # Remove <b> tags around table name
    content = re.sub(r'<b>(.*?)</b>', r'\1', content)
    
    # Split by <br> and <hr> to get individual lines
    lines = re.split(r'<br>|<hr>', content)
    lines = [line.strip() for line in lines if line.strip()]
    
    # First line is table name (without any HTML)
    table_name = re.sub(r'<[^>]+>', '', lines[0]) if lines else "Table"
    
    # Rest are fields
    fields = []
    for line in lines[1:]:
        # Clean any remaining HTML tags
        clean_line = re.sub(r'<[^>]+>', '', line).strip()
        if clean_line:
            fields.append(clean_line)
    
    return table_name, fields

def create_table_cells(parent, cell_id, table_name, fields, geometry, style):
    """Create a parent swimlane and child cells for each field."""
    # Extract colors from original style
    fill_color = ""
    stroke_color = ""
    if "fillColor=" in style:
        fill_match = re.search(r'fillColor=#([a-fA-F0-9]{6})', style)
        if fill_match:
            fill_color = f"fillColor=#{fill_match.group(1)};"
    if "strokeColor=" in style:
        stroke_match = re.search(r'strokeColor=#([a-fA-F0-9]{6})', style)
        if stroke_match:
            stroke_color = f"strokeColor=#{stroke_match.group(1)};"
    
    # Calculate total height
    total_height = 30 + (len(fields) * 30)
    
    # Create parent swimlane
    parent_style = f"swimlane;fontStyle=1;childLayout=stackLayout;horizontal=1;startSize=30;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=1;marginBottom=0;whiteSpace=wrap;html=1;{fill_color}{stroke_color}"
    
    parent_cell = ET.SubElement(parent, 'mxCell')
    parent_cell.set('id', cell_id)
    parent_cell.set('value', table_name)
    parent_cell.set('style', parent_style)
    parent_cell.set('parent', '1')
    parent_cell.set('vertex', '1')
    
    parent_geom = ET.SubElement(parent_cell, 'mxGeometry')
    parent_geom.set('x', geometry['x'])
    parent_geom.set('y', geometry['y'])
    parent_geom.set('width', geometry['width'])
    parent_geom.set('height', str(total_height))
    parent_geom.set('as', 'geometry')
    
    # Create child cells for each field
    child_cells = []
    for idx, field in enumerate(fields):
        child_id = f"{cell_id}-{idx+1}"
        child_style = "text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=4;spacingRight=4;overflow=hidden;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;rotatable=0;whiteSpace=wrap;html=1;"
        
        child_cell = ET.SubElement(parent, 'mxCell')
        child_cell.set('id', child_id)
        child_cell.set('value', field)
        child_cell.set('style', child_style)
        child_cell.set('parent', cell_id)
        child_cell.set('vertex', '1')
        
        child_geom = ET.SubElement(child_cell, 'mxGeometry')
        child_geom.set('y', str(30 + (idx * 30)))
        child_geom.set('width', geometry['width'])
        child_geom.set('height', '30')
        child_geom.set('as', 'geometry')
        
        child_cells.append(child_id)
    
    return parent_cell, child_cells

def restructure_diagram():
    """Main function to restructure the diagram."""
    # Parse the original file
    tree = ET.parse('d:/web_pos/schema.drawio')
    root = tree.getroot()
    
    # Find the Database Schema diagram
    for diagram in root.findall('diagram'):
        if diagram.get('name') == 'Database Schema':
            model = diagram.find('mxGraphModel')
            if model is None:
                continue
                
            model_root = model.find('root')
            if model_root is None:
                continue
            
            # Store edges for later
            edges = []
            
            # Find all table cells and store their info
            tables_info = []
            cells_to_remove = []
            
            for cell in model_root.findall('mxCell'):
                cell_id = cell.get('id')
                
                # Skip root cells
                if cell_id in ['0', '1']:
                    continue
                
                # Store edges
                if cell.get('edge') == '1':
                    edges.append((cell, cell.get('source'), cell.get('target')))
                    cells_to_remove.append(cell)
                    continue
                
                # Check if it's a table (has swimlane style)
                style = cell.get('style', '')
                if 'swimlane' in style and cell.get('value'):
                    value = cell.get('value', '')
                    geom = cell.find('mxGeometry')
                    
                    if geom is not None:
                        geometry = {
                            'x': geom.get('x'),
                            'y': geom.get('y'),
                            'width': geom.get('width'),
                            'height': geom.get('height')
                        }
                        
                        table_name, fields = parse_table_content(value)
                        tables_info.append({
                            'id': cell_id,
                            'name': table_name,
                            'fields': fields,
                            'geometry': geometry,
                            'style': style
                        })
                        cells_to_remove.append(cell)
            
            # Remove old cells
            for cell in cells_to_remove:
                model_root.remove(cell)
            
            # Create new structured cells
            for table_info in tables_info:
                create_table_cells(
                    model_root,
                    table_info['id'],
                    table_info['name'],
                    table_info['fields'],
                    table_info['geometry'],
                    table_info['style']
                )
            
            # Re-add edges at the end
            for edge_cell, source, target in edges:
                model_root.append(edge_cell)
    
    # Write the restructured file
    tree.write('d:/web_pos/schema.drawio', encoding='utf-8', xml_declaration=True)
    print("✓ Diagram restructured successfully!")
    print(f"✓ Processed {len(tables_info)} tables with properly aligned cells")

if __name__ == '__main__':
    try:
        restructure_diagram()
    except Exception as e:
        print(f"✗ Error: {e}")
        import traceback
        traceback.print_exc()
