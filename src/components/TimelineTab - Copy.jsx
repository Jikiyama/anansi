import React from "react";
import { Chrono } from "react-chrono";

function TimelineTab({ timelineData }) {
  if (!timelineData || !Array.isArray(timelineData) || timelineData.length === 0) {
    return <p>No timeline data found</p>;
  }

  // Convert timeline_of_events into items for react-chrono
  // e.g.:
  // [
  //   {
  //     date: "2025-02-01",
  //     events: [
  //       {
  //         event_summary: "...",
  //         event_verb: "...",
  //         temporal_reference_connection: "..."
  //       }
  //     ]
  //   },
  //   ...
  // ]

  const items = timelineData.map((block) => {
    const { date, events } = block;
    const eventsDescription = events
      .map(
        (evt) =>
          `Event Summary: ${evt.event_summary}\n` +
          `Event Verb: ${evt.event_verb}\n` +
          `Reference: ${evt.temporal_reference_connection}\n`
      )
      .join("\n");

    return {
      title: date,
      cardTitle: `Events on ${date}`,
      cardSubtitle: "",
      cardDetailedText: eventsDescription,
    };
  });

  return (
    <div style={{ width: "100%", height: "500px" }}>
      <Chrono
        items={items}
        mode="VERTICAL_ALTERNATING"
        cardHeight={150}
        scrollable={{ scrollbar: false }}
      />
    </div>
  );
}

export default TimelineTab;
