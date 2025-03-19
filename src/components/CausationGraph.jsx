import React from "react";
import ForceGraph2D from "react-force-graph-2d";

const CausationGraph = ({ eventsCausation, causationRelations }) => {
  console.log("CausationGraph component received data:", { eventsCausation, causationRelations });
  
  // Add default values if the props are undefined
  const events = eventsCausation || [];
  const relations = causationRelations || [];
  
  // If no causation relations, do nothing (or show a placeholder message)
  if (!relations.length) {
    return <div>No causation relations found.</div>;
  }

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
        <p>This graph shows how events are causally related (one event causing another)</p>
      </div>
      <div style={{ width: '800px', height: '600px', border: '1px solid #ccc' }}>
        <ForceGraph2D
          graphData={{ nodes, links }}
          nodeAutoColorBy="id"
          
          // Make links thicker and colorful
          linkWidth={2}
          linkColor={() => '#FF6B6B'}  // Red for causation
          
          // Enable directed arrows
          linkDirectionalArrowLength={6}
          linkDirectionalArrowRelPos={1}
          
          // Add particles to visualize direction of causation
          linkDirectionalParticles={2}
          linkDirectionalParticleSpeed={0.02}
          linkDirectionalParticleWidth={3}
          linkDirectionalParticleColor={() => '#FF6B6B'}

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
    </div>
  );
};

export default CausationGraph;
