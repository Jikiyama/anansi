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
    <div style={{ width: '800px', height: '600px', border: '1px solid #ccc' }}>
      <ForceGraph2D
        graphData={graphData}
        nodeAutoColorBy="id"
        linkDirectionalArrowLength={6}
        linkDirectionalArrowRelPos={1}

        // 1) Draw text along each link:
        linkDirectionalText={link => link.relation}
        linkDirectionalTextOffset={-8}

        // 2) Custom-draw each node + text in nodeCanvasObject:
        nodeCanvasObject={(node, ctx, globalScale) => {
          const label = node.label || node.id;
          const fontSize = 12 / globalScale;
          ctx.font = `${fontSize}px Sans-Serif`;

          // Draw circle for the node
          ctx.beginPath();
          ctx.arc(node.x, node.y, 5, 0, 2 * Math.PI, false);
          ctx.fillStyle = node.color || 'gray';
          ctx.fill();

          // Draw the node label (slightly offset)
          ctx.fillStyle = 'black';
          ctx.fillText(label, node.x + 8, node.y + 4);
        }}
      />
    </div>
  );
}
