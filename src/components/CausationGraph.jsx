import React, { useState, useRef, useCallback } from "react";
import ForceGraph2D from "react-force-graph-2d";

const CausationGraph = ({ eventsCausation, causationRelations }) => {
  console.log("CausationGraph component received data:", { eventsCausation, causationRelations });
  const [hoveredLink, setHoveredLink] = useState(null);
  const graphRef = useRef();
  
  // Add default values if the props are undefined
  const events = eventsCausation || [];
  const relations = causationRelations || [];
  
  // If no causation relations, do nothing (or show a placeholder message)
  if (!relations.length) {
    return <div>No causation relations found.</div>;
  }

  // Handle link hover
  const handleLinkHover = useCallback(link => {
    setHoveredLink(link);
    
    // Set cursor to pointer when hovering over a link
    document.getElementById('causation-graph-container').style.cursor = link ? 'pointer' : 'default';
    
    // Re-render the graph
    if (graphRef.current) {
      graphRef.current.refresh();
    }
  }, []);

  // Format tooltip for links
  const getLinkTooltip = useCallback(link => {
    if (!link) return '';
    return `${link.source.id || link.source} CAUSES ${link.target.id || link.target}`;
  }, []);

  // Build nodes from eventsCausation (using occurrence_summary as the node id)
  // Also add any nodes referenced in the causation relations that might be missing
  const nodesMap = new Map();

  events.forEach((event, index) => {
    const id = event.occurrence_summary || `event-${index}`;
    nodesMap.set(id, { id, label: event.occurrence_summary });
  });

  relations.forEach((relation) => {
    const { source_occurrence_summary, target_occurrence_summary } = relation;
    if (!nodesMap.has(source_occurrence_summary)) {
      nodesMap.set(source_occurrence_summary, {
        id: source_occurrence_summary,
        label: source_occurrence_summary,
      });
    }
    if (!nodesMap.has(target_occurrence_summary)) {
      nodesMap.set(target_occurrence_summary, {
        id: target_occurrence_summary,
        label: target_occurrence_summary,
      });
    }
  });

  const nodes = Array.from(nodesMap.values());
  const links = relations.map((relation, index) => ({
    source: relation.source_occurrence_summary,
    target: relation.target_occurrence_summary,
    id: index,
  }));

  return (
    <div>
      <div style={{ marginBottom: '10px' }}>
        <h3>Causation Graph</h3>
        <p><b>Hover over the arrows to see the causal relationships.</b> This graph shows how events cause other events.</p>
        {hoveredLink && (
          <div style={{ 
            backgroundColor: '#fff0f0', 
            padding: '8px', 
            borderRadius: '4px',
            border: '1px solid #FF6B6B',
            marginTop: '10px'
          }}>
            <b>Highlighted Causation:</b> {hoveredLink.source.id || hoveredLink.source} <span style={{ color: '#FF6B6B', fontWeight: 'bold' }}>CAUSES</span> {hoveredLink.target.id || hoveredLink.target}
          </div>
        )}
      </div>
      <div 
        id="causation-graph-container"
        style={{ 
          width: '800px', 
          height: '600px', 
          border: '1px solid #ccc',
          position: 'relative'
        }}
      >
        <ForceGraph2D
          ref={graphRef}
          graphData={{ nodes, links }}
          nodeAutoColorBy="id"
          
          // Make links thicker and colorful - highlight hovered link
          linkWidth={link => link === hoveredLink ? 4 : 2}
          linkColor={link => link === hoveredLink ? '#ff9900' : '#FF6B6B'}
          
          // Enable directed arrows
          linkDirectionalArrowLength={6}
          linkDirectionalArrowRelPos={1}
          
          // Add particles to visualize direction of causation
          linkDirectionalParticles={link => link === hoveredLink ? 4 : 2}
          linkDirectionalParticleSpeed={0.02}
          linkDirectionalParticleWidth={link => link === hoveredLink ? 5 : 3}
          linkDirectionalParticleColor={link => link === hoveredLink ? '#ff9900' : '#FF6B6B'}

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
              const textWidth = ctx.measureText("CAUSES").width;
              const bckgDimensions = [textWidth, fontSize].map(n => n + 12);
              
              ctx.fillStyle = 'rgba(255, 153, 0, 0.2)';
              ctx.fillRect(
                x - bckgDimensions[0]/2, 
                y - bckgDimensions[1]/2, 
                bckgDimensions[0], 
                bckgDimensions[1]
              );
              
              // Draw CAUSES text
              ctx.fillStyle = '#ff9900';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText("CAUSES", x, y);
              
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
            const label = node.label;
            const fontSize = 14 / globalScale;  // Slightly larger font
            ctx.font = `bold ${fontSize}px Sans-Serif`;

            // Draw circle for the node
            ctx.beginPath();
            ctx.arc(node.x, node.y, 6, 0, 2 * Math.PI, false);  // Slightly larger circle
            ctx.fillStyle = node.color || '#6A0DAD';  // Default to purple if no color
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
          <li>Hover over the arrows to see the causal relationships</li>
          <li>The direction of the arrow shows which event causes another</li>
          <li>Drag nodes to rearrange the graph</li>
          <li>Scroll to zoom in/out</li>
        </ul>
      </div>
    </div>
  );
};

export default CausationGraph;
