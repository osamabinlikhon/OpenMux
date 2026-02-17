import React, { useEffect, useState } from "react";
import "./ToolsPanel.css";

interface ToolsPanelProps {
  sessionId: string | null;
}

interface Tool {
  name: string;
  description: string;
  actions: string[];
}

export default function ToolsPanel({ sessionId }: ToolsPanelProps) {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [selectedAction, setSelectedAction] = useState("");
  const [params, setParams] = useState("");
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    fetchTools();
  }, [sessionId]);

  const fetchTools = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8080/tools");
      const data = await response.json();
      setTools(data.tools || []);
    } catch (error) {
      console.error("Failed to fetch tools:", error);
    } finally {
      setLoading(false);
    }
  };

  const executeTool = async () => {
    if (!selectedTool || !selectedAction) return;

    try {
      const response = await fetch(
        `http://localhost:8080/tools/${selectedTool.name}/${selectedAction}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ params: JSON.parse(params || "{}") }),
        },
      );
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: String(error) });
    }
  };

  if (loading) {
    return (
      <div className="tools-panel">
        <p>Loading tools...</p>
      </div>
    );
  }

  return (
    <div className="tools-panel">
      <h2>🛠️ Available Tools</h2>

      <div className="tools-grid">
        {tools.map((tool) => (
          <div
            key={tool.name}
            className={`tool-card ${selectedTool?.name === tool.name ? "selected" : ""}`}
            onClick={() => {
              setSelectedTool(tool);
              setSelectedAction("");
            }}
          >
            <h3>{tool.name}</h3>
            <p>{tool.description}</p>
            <div className="actions">
              {tool.actions.map((action) => (
                <span key={action} className="action-tag">
                  {action}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedTool && (
        <div className="tool-executor">
          <h3>Execute {selectedTool.name}</h3>

          <div className="form-group">
            <label>Action:</label>
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
            >
              <option value="">Select an action</option>
              {selectedTool.actions.map((action) => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Parameters (JSON):</label>
            <textarea
              value={params}
              onChange={(e) => setParams(e.target.value)}
              placeholder='{"key": "value"}'
            />
          </div>

          <button onClick={executeTool} disabled={!selectedAction}>
            Execute
          </button>

          {result && (
            <div className="result">
              <h4>Result:</h4>
              <pre>{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
