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
 *
 * This component converts that array into a node/link structure for react-force-graph-2d.
 */
export default function EntityRelationsGraph({ data }) {
  // Prepare the graph in the { nodes: [...], links: [...] } format
  const graphData = useMemo(() => {
    if (!data || data.length === 0) {
      return { nodes: [], links: [] };
    }

    // Collect all unique entity names
    const uniqueEntities = new Set();
    data.forEach(rel => {
      uniqueEntities.add(rel.source_entity);
      uniqueEntities.add(rel.target_entity);
    });

    // Build nodes
    const nodes = Array.from(uniqueEntities).map(entityName => ({
      id: entityName
      // Optional: you could attach more attributes here
    }));

    // Build links (one per relation)
    const links = data.map((rel, idx) => ({
      source: rel.source_entity,
      target: rel.target_entity,
      relation: rel.relation
    }));

    return { nodes, links };
  }, [data]);

  // If no data found, just show a placeholder
  if (!graphData.nodes.length) {
    return <p>No entity relations found.</p>;
  }

  return (
    <div style={{ width: '100%', height: '600px', border: '1px solid #ccc' }}>
      <ForceGraph2D
        graphData={graphData}
        nodeAutoColorBy="id"
        linkDirectionalArrowLength={6}
        linkDirectionalArrowRelPos={1}
        // Show the relation in a tooltip on hover:
        linkLabel={link => link.relation}
        // If you want the label always on the link line, you can also do:
        linkDirectionalText={link => link.relation}
        linkDirectionalTextOffset={-8}
      />
    </div>
  );
}
