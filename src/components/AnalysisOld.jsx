import React, { useState } from "react";
import TimelineTab from "./TimelineTab.jsx";
import CausationGraph from "./CausationGraph.jsx";

function AnalysisTabs({ analysisData }) {
  const [activeTab, setActiveTab] = useState("summary");

  const renderSummaryTab = () => {
    return (
      <div>
        <h3>Summary</h3>
        <p>{analysisData.summary || "No summary found"}</p>
      </div>
    );
  };

  const renderEntitiesTab = () => {
    const { named_entities } = analysisData;
    if (!named_entities) {
      return <p>No named entities found.</p>;
    }
    return (
      <div>
        <h3>Entities</h3>
        {/* Persons */}
        <h4>Persons</h4>
        <ul>
          {named_entities.persons && named_entities.persons.length > 0 ? (
            named_entities.persons.map((person, idx) => (
              <li key={idx}>
                <strong>{person.entity}</strong> - {person.description}
              </li>
            ))
          ) : (
            <li>No persons found</li>
          )}
        </ul>

        {/* Organizations */}
        <h4>Organizations</h4>
        <ul>
          {named_entities.organizations && named_entities.organizations.length > 0 ? (
            named_entities.organizations.map((org, idx) => (
              <li key={idx}>
                <strong>{org.entity}</strong> - {org.description}
              </li>
            ))
          ) : (
            <li>No organizations found</li>
          )}
        </ul>

        {/* Locations */}
        <h4>Locations</h4>
        <ul>
          {named_entities.locations && named_entities.locations.length > 0 ? (
            named_entities.locations.map((loc, idx) => (
              <li key={idx}>
                <strong>{loc.entity}</strong> - {loc.description}
              </li>
            ))
          ) : (
            <li>No locations found</li>
          )}
        </ul>

        {/* Institutions */}
        <h4>Institutions</h4>
        <ul>
          {named_entities.institutions && named_entities.institutions.length > 0 ? (
            named_entities.institutions.map((inst, idx) => (
              <li key={idx}>
                <strong>{inst.entity}</strong> - {inst.description}
              </li>
            ))
          ) : (
            <li>No institutions found</li>
          )}
        </ul>

        {/* Dates */}
        <h4>Dates</h4>
        <ul>
          {named_entities.dates && named_entities.dates.length > 0 ? (
            named_entities.dates.map((dt, idx) => (
              <li key={idx}>
                <strong>{dt.entity}</strong> - {dt.description}
              </li>
            ))
          ) : (
            <li>No dates found</li>
          )}
        </ul>

        {/* Legal Terms */}
        <h4>Legal Terms</h4>
        <ul>
          {named_entities.legal_terms && named_entities.legal_terms.length > 0 ? (
            named_entities.legal_terms.map((term, idx) => (
              <li key={idx}>
                <strong>{term.entity}</strong> - {term.description}
              </li>
            ))
          ) : (
            <li>No legal terms found</li>
          )}
        </ul>
      </div>
    );
  };

  const renderEventsTab = () => {
    const { events } = analysisData;
    if (!events || events.length === 0) {
      return <p>No events found.</p>;
    }

    return (
      <div>
        <h3>Events</h3>
        <ul>
          {events.map((evt, idx) => (
            <li key={idx} style={{ marginBottom: "1rem" }}>
              <strong>Sentence:</strong> {evt.sentence}
              <br />
              <strong>Event Type:</strong> {evt.event_type}
              <br />
              <strong>Verb:</strong> {evt.verb}
              {evt.agent && (
                <>
                  <br />
                  <strong>Agent:</strong> {evt.agent}
                </>
              )}
              {evt.patients && (
                <>
                  <br />
                  <strong>Patients:</strong> {evt.patients}
                </>
              )}
              {evt.cause && (
                <>
                  <br />
                  <strong>Cause:</strong> {evt.cause}
                </>
              )}
              {evt.purpose_context && (
                <>
                  <br />
                  <strong>Purpose:</strong> {evt.purpose_context}
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const renderTemporalTab = () => {
    const { temporal_references } = analysisData;
    if (!temporal_references || temporal_references.length === 0) {
      return <p>No temporal references found.</p>;
    }

    return (
      <div>
        <h3>Temporal References</h3>
        <ul>
          {temporal_references.map((tRef, idx) => (
            <li key={idx}>
              <strong>{tRef.reference}</strong>: {tRef.description}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const renderTimelineTab = () => {
    return <TimelineTab timelineData={analysisData.timeline_of_events} />;
  };

  const renderCausationTab = () => {
    // Get causation data from the unified JSON
    const { events_causation, causation_relations } = analysisData;

    return (
      <div>
        <h3>Causation</h3>
        <CausationGraph
          eventsCausation={events_causation}
          causationRelations={causation_relations}
        />
      </div>
    );
  };

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
      case "causation":
        return renderCausationTab();
      default:
        return <div>No tab selected</div>;
    }
  };

  return (
    <div>
      <nav style={{ marginBottom: "1rem" }}>
        <button onClick={() => setActiveTab("summary")}>Summary</button>
        <button onClick={() => setActiveTab("entities")}>Entities</button>
        <button onClick={() => setActiveTab("events")}>Events</button>
        <button onClick={() => setActiveTab("temporal")}>Temporal</button>
        <button onClick={() => setActiveTab("timeline")}>Timeline</button>
        <button onClick={() => setActiveTab("causation")}>Causation</button>
      </nav>
      {renderContent()}
    </div>
  );
}

export default AnalysisTabs;
