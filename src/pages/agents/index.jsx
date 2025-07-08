import React, { useState, useEffect } from "react";
import { agentService } from "../../services/agentService";
import { userService } from "../../services/userService";

const AgentsPage = () => {
  const [prompt, setPrompt] = useState("");
  const [ideas, setIdeas] = useState([]);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedIdeas = userService.getIdeas();
    setIdeas(savedIdeas || []);
  }, []);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);
    try {
      const finalResult = await agentService.executeWorkflow(ideas);
      setResult(finalResult);
    } catch (error) {
      console.error("An error occurred during the analysis:", error);
    }
    setIsLoading(false);
  };

  const handleSaveIdea = () => {
    if (!prompt) return;
    const updatedIdeas = userService.saveIdea(prompt);
    setIdeas(updatedIdeas || []);
    setPrompt("");
  };


  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h1 className="text-2xl font-bold mb-4">Agent Workflow</h1>
          <form onSubmit={handleSubmit}>
            <textarea
              className="w-full p-2 border rounded"
              rows="4"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your product idea..."
            ></textarea>
            <div className="flex space-x-2">
              <button
                type="submit"
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
                disabled={isLoading}
              >
                {isLoading ? "Starting..." : "Start Workflow"}
              </button>
            </div>
          </form>


          {result && (
            <div className="mt-8 p-4 border rounded">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-bold">Final Strategy</h2>
              </div>
              <pre>{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-4">Idea Bank</h2>
          <div className="space-y-2">
            {ideas.map((idea, index) => (
              <div
                key={index}
                className="p-2 border rounded bg-gray-100 cursor-pointer hover:bg-gray-200"
                onClick={() => setPrompt(idea.content)}
              >
                {idea.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentsPage;