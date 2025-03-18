import React from "react";
import { Chrono } from "react-chrono";

function TimelineTab({ timelineData }) {
  if (!timelineData || !Array.isArray(timelineData) || timelineData.length === 0) {
    return <p>No timeline data found</p>;
  }

  // Sort timelineData chronologically by date (ascending order)
  const sortedTimelineData = [...timelineData].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  const items = sortedTimelineData.map((block) => {
    const { date, events } = block;
    const eventsDescription = events
      .map(
        (evt) =>
          `${evt.event_summary}\n` 
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
