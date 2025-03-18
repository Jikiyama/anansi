import React from "react";
import ForceGraph2D from "react-force-graph-2d";

const CausationGraph = ({ eventsCausation = [], causationRelations = [] }) => {
  // If no causation data, show a message.
  if (
    (!eventsCausation || eventsCausation.length === 0) &&
    (!causationRelations || causationRelations.length === 0)
  ) {
    return <p>No causation data found.</p>;
  }

  // Build a map of nodes. Use occurrence_summary as the unique id.
  const nodesMap = new Map();

  eventsCausation.forEach((evt, index) => {
    const id = evt.occurrence_summary || `event-${index}`;
    nodesMap.set(id, { id, label: evt.occurrence_summary });
  });

  // Ensure nodes referenced in causationRelations are also included.
  causationRelations.forEach((rel) => {
    const { source_occurrence_summary, target_occurrence_summary } = rel;
    if (source_occurrence_summary && !nodesMap.has(source_occurrence_summary)) {
      nodesMap.set(source_occurrence_summary, {
        id: source_occurrence_summary,
        label: source_occurrence_summary,
      });
    }
    if (target_occurrence_summary && !nodesMap.has(target_occurrence_summary)) {
      nodesMap.set(target_occurrence_summary, {
        id: target_occurrence_summary,
        label: target_occurrence_summary,
      });
    }
  });

  const nodes = Array.from(nodesMap.values());
  const links = causationRelations.map((rel, idx) => ({
    source: rel.source_occurrence_summary,
    target: rel.target_occurrence_summary,
    id: idx,
  }));

  return (
    <div>
      <ForceGraph2D
        graphData={{ nodes, links }}
        nodeAutoColorBy="id"
        nodeCanvasObject={(node, ctx, globalScale) => {
          const label = node.label;
          const fontSize = 12 / globalScale;
          ctx.font = `${fontSize}px Sans-Serif`;
          // Draw the node
          ctx.beginPath();
          ctx.arc(node.x, node.y, 5, 0, 2 * Math.PI, false);
          ctx.fillStyle = node.color;
          ctx.fill();
          // Draw the label
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
