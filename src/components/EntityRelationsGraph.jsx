import React, { useMemo } from 'react';
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
      relation: rel.relation // We'll draw this text on the link
    }));

    return { nodes, links };
  }, [data]);

  if (!graphData.nodes.length) {
    return <p>No entity relations found.</p>;
  }

  return (
    <div>
      <div style={{ marginBottom: '10px' }}>
        <h3>Entity Relations Graph</h3>
        <p>The text on edges represents the relationship between entities (e.g., "{data?.[0]?.relation || 'attacked'}")</p>
      </div>
      <div style={{ width: '800px', height: '600px', border: '1px solid #ccc' }}>
        <ForceGraph2D
          graphData={graphData}
          nodeAutoColorBy="id"
          linkDirectionalArrowLength={6}
          linkDirectionalArrowRelPos={1}
          
          // Make links thicker and colorful
          linkWidth={2}
          linkColor={() => '#007BFF'}  // Use a consistent blue color for links

          // Draw text along each link with enhanced visibility:
          linkDirectionalText={link => link.relation}
          linkDirectionalTextColor={() => 'black'}
          linkDirectionalTextOffset={-10}
          linkDirectionalTextSize={14}  // Larger text
          linkDirectionalTextMode="intermediate" // Better positioning

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
    </div>
  );
}
