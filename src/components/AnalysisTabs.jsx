import React, { useState, useEffect } from "react";
import TimelineTab from "./TimelineTab.jsx";
// import CausationGraph from "./CausationGraph.jsx"; // deprecated
import EntityRelationsGraph from "./EntityRelationsGraph.jsx";
import DictionaryPlusTab from "./DictionaryPlusTab.jsx";
import EventRelationsGraph from "./EventRelationsGraph.jsx";

function AnalysisTabs({ analysisData }) {
  // ------------------------- state -----------------------------------------
  const [activeTab, setActiveTab] = useState("summary");

  /* Events‑tab local state */
  const [eventsSearch, setEventsSearch] = useState("");
  const [eventsPage, setEventsPage] = useState(1);
  const EVENTS_PER_PAGE = 15;

  // If search term changes, reset to page 1
  useEffect(() => {
    setEventsPage(1);
  }, [eventsSearch]);

  // ------------------------- Summary --------------------------------------
  const renderSummaryTab = () => (
    <div>
      <h3>Summary</h3>
      <p>{analysisData.summary || "No summary found"}</p>
    </div>
  );

  // ------------------------- Entities -------------------------------------
  const renderEntitiesTab = () => {
    const { named_entities } = analysisData;
    if (!named_entities) return <p>No named entities found.</p>;

    const section = (label, arr = []) => (
      <>
        <h4>{label}</h4>
        <ul>
          {arr.length ? (
            arr.map((item, i) => (
              <li key={i}>
                <strong>{item.entity}</strong> – {item.description}
              </li>
            ))
          ) : (
            <li>No {label.toLowerCase()} found</li>
          )}
        </ul>
      </>
    );

    return (
      <div>
        <h3>Entities</h3>
        {section("Persons", named_entities.persons)}
        {section("Organizations", named_entities.organizations)}
        {section("Locations", named_entities.locations)}
        {section("Institutions", named_entities.institutions)}
        {section("Dates", named_entities.dates)}
        {section("Legal Terms", named_entities.legal_terms)}
      </div>
    );
  };

  // ------------------------- Events (table + pagination) -------------------
  const tdStyle = {
    border: "1px solid #ddd",
    padding: "8px",
    verticalAlign: "top",
  };

  const renderEventsTab = () => {
    const { events } = analysisData;
    if (!events?.length) return <p>No events found.</p>;

    // --- filtering --------------------------------------------------------
    const term = eventsSearch.trim().toLowerCase();
    const filtered = term
      ? events.filter((e) =>
          [e.sentence, e.event_type, e.verb, e.agent, e.patients]
            .filter(Boolean)
            .some((field) => field.toLowerCase().includes(term))
        )
      : events;

    // --- pagination -------------------------------------------------------
    const totalPages = Math.max(1, Math.ceil(filtered.length / EVENTS_PER_PAGE));
    const startIdx = (eventsPage - 1) * EVENTS_PER_PAGE;
    const pageSlice = filtered.slice(startIdx, startIdx + EVENTS_PER_PAGE);

    const pageButton = (num) => (
      <button
        key={num}
        onClick={() => setEventsPage(num)}
        style={{
          margin: "0 2px",
          padding: "4px 8px",
          background: num === eventsPage ? "#007BFF" : "#f0f0f0",
          color: num === eventsPage ? "white" : "black",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        {num}
      </button>
    );

    return (
      <div>
        <h3>Events</h3>

        {/* search box */}
        <input
          type="text"
          placeholder="Search events…"
          value={eventsSearch}
          onChange={(e) => setEventsSearch(e.target.value)}
          style={{ marginBottom: "0.75rem", padding: "6px 10px", width: "100%", maxWidth: "400px" }}
        />

        {/* table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr>
                {[
                  "Sentence",
                  "Event Type",
                  "Verb",
                  "Agent",
                  "Patients",
                  "Cause",
                  "Purpose",
                ].map((col) => (
                  <th
                    key={col}
                    style={{
                      ...tdStyle,
                      background: "#f2f2f2",
                      whiteSpace: "nowrap",
                      textAlign: "left",
                    }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageSlice.map((evt, idx) => (
                <tr key={idx}>
                  <td style={tdStyle}>{evt.sentence}</td>
                  <td style={tdStyle}>{evt.event_type}</td>
                  <td style={tdStyle}>{evt.verb}</td>
                  <td style={tdStyle}>{evt.agent || "—"}</td>
                  <td style={tdStyle}>{evt.patients || "—"}</td>
                  <td style={tdStyle}>{evt.cause || "—"}</td>
                  <td style={tdStyle}>{evt.purpose_context || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* pagination controls */}
        <div style={{ marginTop: "0.75rem", display: "flex", alignItems: "center" }}>
          <button
            onClick={() => setEventsPage((p) => Math.max(1, p - 1))}
            disabled={eventsPage === 1}
            style={{ marginRight: "6px" }}
          >
            ◀ Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => pageButton(i + 1))}
          <button
            onClick={() => setEventsPage((p) => Math.min(totalPages, p + 1))}
            disabled={eventsPage === totalPages}
            style={{ marginLeft: "6px" }}
          >
            Next ▶
          </button>
        </div>
      </div>
    );
  };

  // ------------------------- Temporal -------------------------------------
  const renderTemporalTab = () => {
    const { temporal_references } = analysisData;
    if (!temporal_references?.length) return <p>No temporal references found.</p>;

    return (
      <div>
        <h3>Temporal References</h3>
        <ul>
          {temporal_references.map((t, i) => (
            <li key={i}>
              <strong>{t.reference}</strong>: {t.description}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  // ------------------------- Timeline -------------------------------------
  const renderTimelineTab = () => (
    <TimelineTab timelineData={analysisData.timeline_of_events || []} />
  );

  // ------------------------- Event Relations -----------------------------
  const renderEventRelationsTab = () => (
    <div>
      <h3>Event Relations</h3>
      <EventRelationsGraph data={analysisData.event_relations || {}} />
    </div>
  );

  // ------------------------- Entity Relations -----------------------------
  const renderEntityRelationsTab = () => (
    <div>
      <h3>Entity Relations</h3>
      <EntityRelationsGraph data={analysisData.entity_relations || []} />
    </div>
  );

  // ------------------------- Dictionary+ ----------------------------------
  const renderDictionaryPlusTab = () => <DictionaryPlusTab analysisData={analysisData} />;

  // ------------------------- Tab content switcher -------------------------
  const renderContent = () => {
    switch (activeTab) {
      case "summary":
        return renderSummaryTab();
      case "entities":
        return renderEntitiesTab();
      case "events":
        return renderEventsTab();
      case "temporal":
        return renderTemporalTab();
      case "timeline":
        return renderTimelineTab();
      case "event-relations":
        return renderEventRelationsTab();
      case "entity-relations":
        return renderEntityRelationsTab();
      case "dictionary-plus":
        return renderDictionaryPlusTab();
      default:
        return <div>No tab selected</div>;
    }
  };

  // ------------------------- Tab buttons ----------------------------------
  const tabBtn = (id, label) => (
    <button
      key={id}
      onClick={() => setActiveTab(id)}
      style={{
        background: activeTab === id ? "#007BFF" : "#f0f0f0",
        color: activeTab === id ? "white" : "black",
        border: "none",
        padding: "0.5rem 1rem",
        marginRight: "0.5rem",
        marginBottom: "0.5rem",
        cursor: "pointer",
        borderRadius: "4px",
      }}
    >
      {label}
    </button>
  );

  // ------------------------- Render ---------------------------------------
  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", marginBottom: "1rem" }}>
        {tabBtn("summary", "Summary")}
        {tabBtn("entities", "Entities")}
        {tabBtn("events", "Events")}
        {tabBtn("temporal", "Temporal")}
        {tabBtn("timeline", "Timeline")}
        {tabBtn("event-relations", "Event Relations")}
        {tabBtn("entity-relations", "Entity Relations")}
        {tabBtn("dictionary-plus", "Dictionary+")}
      </div>
      {renderContent()}
    </div>
  );
}

export default AnalysisTabs;
