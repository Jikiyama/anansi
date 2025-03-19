import React, { useMemo, useState, useRef, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

/**
 * Expects props.data to be an array of objects like:
 *  [
 *    {
 *      "source_entity": "drones",
 *      "target_entity": "civilians",
 *      "relation": "kill"
 *    },
 *    ...
 *  ]
 */
export default function EntityRelationsGraph({ data }) {
  console.log("EntityRelationsGraph component received data:", data);
  const [hoveredLink, setHoveredLink] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0, visible: false });
  const graphRef = useRef();
  
  // Convert "entity_relations" array into { nodes: [...], links: [...] } format
  const graphData = useMemo(() => {
    if (!data || data.length === 0) {
      return { nodes: [], links: [] };
    }

    // Gather unique entity names to form nodes
    const uniqueEntities = new Set();
    data.forEach(rel => {
      uniqueEntities.add(rel.source_entity);
      uniqueEntities.add(rel.target_entity);
    });

    const nodes = Array.from(uniqueEntities).map(entityName => ({
      id: entityName,
      label: entityName  // <--- We'll draw the label on the node
    }));

    // Each relation becomes a link
    const links = data.map((rel, idx) => ({
      source: rel.source_entity,
      target: rel.target_entity,
      relation: rel.relation, // We'll draw this text on the link
      id: idx
    }));

    return { nodes, links };
  }, [data]);

  // Mouse move handler to track cursor position
  const handleMouseMove = useCallback((event) => {
    const containerRect = document.getElementById('entity-graph-container').getBoundingClientRect();
    setTooltipPos({
      x: event.clientX - containerRect.left,
      y: event.clientY - containerRect.top,
      visible: !!hoveredLink
    });
  }, [hoveredLink]);

  const handleLinkHover = useCallback(link => {
    setHoveredLink(link);
    
    // Set cursor to pointer when hovering over a link
    const container = document.getElementById('entity-graph-container');
    container.style.cursor = link ? 'pointer' : 'default';
    
    // If no link is hovered, hide the tooltip
    if (!link) {
      setTooltipPos(prev => ({ ...prev, visible: false }));
    }
    
    // Re-render the graph
    if (graphRef.current) {
      graphRef.current.refresh();
    }
  }, []);

  // Format relation text for tooltip
  const getLinkTooltip = useCallback(() => {
    // Return empty tooltip to disable the default one
    return '';
  }, []);

  // Effect to add and remove the mousemove listener
  React.useEffect(() => {
    const container = document.getElementById('entity-graph-container');
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      
      // Ensure hover state is reset when leaving the container
      container.addEventListener('mouseleave', () => {
        setHoveredLink(null);
        setTooltipPos(prev => ({ ...prev, visible: false }));
        if (graphRef.current) {
          graphRef.current.refresh();
        }
      });
    }
    
    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseleave', () => {
          setHoveredLink(null);
          setTooltipPos(prev => ({ ...prev, visible: false }));
        });
      }
    };
  }, [handleMouseMove]);

  if (!graphData.nodes.length) {
    return <p>No entity relations found.</p>;
  }

  return (
    <div>
      <div style={{ marginBottom: '10px' }}>
        <h3>Entity Relations Graph</h3>
        <p>
          <b>Hover over the arrows to see the relationship between entities.</b> 
          The relationship (e.g., "{data?.[0]?.relation || 'attacked'}") describes how entities interact.
        </p>
      </div>
      <div 
        id="entity-graph-container"
        style={{ 
          width: '800px', 
          height: '600px', 
          border: '1px solid #ccc', 
          position: 'relative' 
        }}
      >
        {/* Custom tooltip that follows the mouse */}
        {tooltipPos.visible && hoveredLink && (
          <div style={{
            position: 'absolute',
            left: `${tooltipPos.x + 10}px`,
            top: `${tooltipPos.y + 10}px`,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            padding: '5px 8px',
            borderRadius: '4px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            border: '1px solid #007BFF',
            zIndex: 999,
            maxWidth: '250px',
            fontSize: '14px',
            pointerEvents: 'none', // Ensure it doesn't interfere with mouse events
          }}>
            <b>{hoveredLink.source.id || hoveredLink.source}</b> 
            <span style={{ color: '#007BFF', fontWeight: 'bold' }}> {hoveredLink.relation} </span>
            <b>{hoveredLink.target.id || hoveredLink.target}</b>
          </div>
        )}
        
        <ForceGraph2D
          ref={graphRef}
          graphData={graphData}
          nodeAutoColorBy="id"
          linkDirectionalArrowLength={6}
          linkDirectionalArrowRelPos={1}
          
          // Make links thicker and colorful - highlight hovered link
          linkWidth={link => link === hoveredLink ? 4 : 2}
          linkColor={link => link === hoveredLink ? '#ff9900' : '#007BFF'}

          // Draw text along each link with enhanced visibility:
          linkDirectionalText={link => link.relation}
          linkDirectionalTextColor={() => 'black'}
          linkDirectionalTextOffset={-10}
          linkDirectionalTextSize={link => link === hoveredLink ? 18 : 14}
          linkDirectionalTextMode="intermediate"
          
          // Handle hover events
          onLinkHover={handleLinkHover}
          linkLabel={getLinkTooltip}
          linkCanvasObjectMode={() => 'after'}
          
          // Custom link drawing to highlight relationships
          linkCanvasObject={(link, ctx, globalScale) => {
            if (link === hoveredLink) {
              // Draw a highlight around the link
              const start = link.source;
              const end = link.target;
              
              // Calculate link midpoint for relation text
              const x = start.x + (end.x - start.x) / 2;
              const y = start.y + (end.y - start.y) / 2;
              
              // Draw a background for the relation text
              const fontSize = 18 / globalScale;
              ctx.font = `bold ${fontSize}px Sans-Serif`;
              const textWidth = ctx.measureText(link.relation).width;
              const bckgDimensions = [textWidth, fontSize].map(n => n + 12);
              
              ctx.fillStyle = 'rgba(255, 153, 0, 0.2)';
              ctx.fillRect(
                x - bckgDimensions[0]/2, 
                y - bckgDimensions[1]/2, 
                bckgDimensions[0], 
                bckgDimensions[1]
              );
              
              // Draw a border around the background
              ctx.strokeStyle = '#ff9900';
              ctx.lineWidth = 2 / globalScale;
              ctx.strokeRect(
                x - bckgDimensions[0]/2, 
                y - bckgDimensions[1]/2, 
                bckgDimensions[0], 
                bckgDimensions[1]
              );
            }
          }}

          // Custom-draw each node + text in nodeCanvasObject:
          nodeCanvasObject={(node, ctx, globalScale) => {
            const label = node.label || node.id;
            const fontSize = 14 / globalScale;  // Slightly larger font
            ctx.font = `bold ${fontSize}px Sans-Serif`;

            // Draw circle for the node
            ctx.beginPath();
            ctx.arc(node.x, node.y, 6, 0, 2 * Math.PI, false);  // Slightly larger circle
            ctx.fillStyle = node.color || '#4CAF50';  // Default to green if no color
            ctx.fill();
            
            // Add a white border
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Draw the node label with a background for better visibility
            const textWidth = ctx.measureText(label).width;
            const bckgDimensions = [textWidth, fontSize].map(n => n + 8);
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fillRect(
              node.x + 8 - 4, 
              node.y + 4 - (fontSize / 2) - 2, 
              bckgDimensions[0], 
              bckgDimensions[1]
            );
            
            ctx.fillStyle = 'black';
            ctx.fillText(label, node.x + 8, node.y + 4);
          }}
          width={800}
          height={600}
        />
      </div>
      <div style={{ marginTop: '10px', border: '1px solid #ddd', padding: '8px', borderRadius: '4px' }}>
        <h4 style={{ margin: '0 0 8px 0' }}>How to use this graph:</h4>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          <li>Hover over the arrows to see the relationship between entities</li>
          <li>The text on each arrow shows the action (e.g., "{data?.[0]?.relation || 'attacked'}")</li>
          <li>Drag nodes to rearrange the graph</li>
          <li>Scroll to zoom in/out</li>
        </ul>
      </div>
    </div>
  );
}
