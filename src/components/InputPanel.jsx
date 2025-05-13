import { useState } from "react";

export default function InputPanel({
  onAnalyzeText,
  onLoadJson,
  isLoading,
  defaultLanguage = "en",
}) {
  const [mode, setMode] = useState("text");          // "text" | "json"
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [language, setLanguage] = useState(defaultLanguage);

  /** Basic schema check for uploaded analysis JSON */
  const validateAnalysisJson = (data) => {
    if (typeof data !== "object" || !data) return false;
    if (!Array.isArray(data.events)) return false;
    if (typeof data.summary !== "string") return false;
    if (typeof data.named_entities !== "object" || !data.named_entities)
      return false;
    return true; // minimal checks; UI handles optional extras gracefully
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === "text") {
      if (!text.trim()) {
        alert("Please enter some text to analyze.");
        return;
      }
      onAnalyzeText(text, language);
      return;
    }

    /* === JSON mode === */
    if (!file) {
      alert("Please choose a JSON file to load.");
      return;
    }
    try {
      const jsonText = await file.text();
      const parsed = JSON.parse(jsonText);
      if (!validateAnalysisJson(parsed)) {
        alert(
          "The uploaded JSON does not match the expected format.\n" +
            "Ensure it contains at least 'events', 'named_entities', and 'summary'."
        );
        return;
      }
      onLoadJson(parsed);
    } catch (err) {
      console.error(err);
      alert("Error reading or parsing the JSON file. Please check the file.");
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {/* --- input-mode toggle --- */}
      <fieldset className="flex items-center gap-6">
        <legend className="font-semibold">Input source</legend>
        <label className="flex items-center gap-1 cursor-pointer">
          <input
            type="radio"
            name="mode"
            value="text"
            checked={mode === "text"}
            onChange={() => setMode("text")}
          />
          Text
        </label>
        <label className="flex items-center gap-1 cursor-pointer">
          <input
            type="radio"
            name="mode"
            value="json"
            checked={mode === "json"}
            onChange={() => setMode("json")}
          />
          JSON file
        </label>
      </fieldset>

      {/* --- text area OR file input --- */}
      {mode === "text" ? (
        <>
          <textarea
            className="w-full h-40 p-2 border rounded"
            placeholder="Paste or type text to analyze…"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="flex items-center gap-2">
            <label className="font-semibold">Output language:</label>
            <select
              className="border rounded p-1"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              {/* add more languages if your backend supports them */}
            </select>
          </div>
        </>
      ) : (
        <input
          type="file"
          accept=".json,application/json"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      )}

      {/* --- submit --- */}
      <button
        type="submit"
        disabled={isLoading}
        className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-60"
      >
        {isLoading
          ? "Loading…"
          : mode === "text"
          ? "Analyze Text"
          : "Load JSON"}
      </button>
    </form>
  );
}
