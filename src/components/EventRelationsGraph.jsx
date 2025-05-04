import React, { useMemo } from "react";
import ForceGraph2D from "react-force-graph-2d";

/**
 * Props:
 *   data = {
 *     events: { e1: "event summary 1", e2: "event summary 2", ... },
 *     relations: [
 *        { source: "e1", target: "e2", type: "CAUSES" },
 *        ...
 *     ]
 *   }
 */
export default function EventRelationsGraph({ data }) {
  // Build graphData = { nodes, links }
  const graphData = useMemo(() => {
    if (!data || !data.events || !data.relations) {
      return { nodes: [], links: [] };
    }

    // Nodes from the events map
    const nodes = Object.entries(data.events).map(([id, summary]) => ({
      id,
      label: summary || id,
    }));

    // Links from relations array
    const links = data.relations.map((rel, idx) => ({
      source: rel.source,
      target: rel.target,
      relation: rel.type,
      id: idx,
    }));

    // Ensure every relation endpoint has a node (in case LLM omitted event entry)
    links.forEach((lnk) => {
      if (!nodes.find((n) => n.id === lnk.source)) {
        nodes.push({ id: lnk.source, label: lnk.source });
      }
      if (!nodes.find((n) => n.id === lnk.target)) {
        nodes.push({ id: lnk.target, label: lnk.target });
      }
    });

    return { nodes, links };
  }, [data]);

  if (!graphData.nodes.length) {
    return <p>No event relations found.</p>;
  }

  return (
    <div>
      <h3>Event Relations Graph</h3>
      <div
        style={{
          width: "800px",
          height: "600px",
          border: "1px solid #ccc",
        }}
      >
        <ForceGraph2D
          graphData={graphData}
          nodeAutoColorBy="id"
          // Arrowheads to show direction
          linkDirectionalArrowLength={6}
          linkDirectionalArrowRelPos={1}
          linkWidth={2}
          linkColor="#FF6B6B"
          // Show relation type on hover
          linkLabel={(link) => link.relation}
          // Draw nodes with labels
          nodeCanvasObject={(node, ctx, globalScale) => {
            const label = node.label || node.id;
            const fontSize = 14 / globalScale;
            ctx.font = `bold ${fontSize}px Sans-Serif`;

            // Node circle
            ctx.beginPath();
            ctx.arc(node.x, node.y, 6, 0, 2 * Math.PI, false);
            ctx.fillStyle = node.color || "#6A0DAD";
            ctx.fill();

            // White border for contrast
            ctx.strokeStyle = "white";
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Text label
            ctx.fillStyle = "black";
            ctx.fillText(label, node.x + 8, node.y + 4);
          }}
          width={800}
          height={600}
        />
      </div>
    </div>
  );
} 