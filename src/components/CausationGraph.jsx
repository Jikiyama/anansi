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
      <h2>Causation Graph</h2>
      <ForceGraph2D
        graphData={{ nodes, links }}
        nodeAutoColorBy="id"
        // Enable directed arrows
        linkDirectionalArrowLength={6}
        // Position the arrowhead at the end of the link
        linkDirectionalArrowRelPos={1}
        // Optionally add particles to highlight direction (uncomment if desired):
        // linkDirectionalParticles={2}
        // linkDirectionalParticleSpeed={0.02}

        nodeCanvasObject={(node, ctx, globalScale) => {
          const label = node.label;
          const fontSize = 12 / globalScale;
          ctx.font = `${fontSize}px Sans-Serif`;
          ctx.beginPath();
          ctx.arc(node.x, node.y, 5, 0, 2 * Math.PI, false);
          ctx.fillStyle = node.color;
          ctx.fill();
          ctx.fillStyle = "black";
          ctx.fillText(label, node.x + 8, node.y + 4);
        }}
        width={800}
        height={600}
      />
    </div>
  );
};

export default CausationGraph;
