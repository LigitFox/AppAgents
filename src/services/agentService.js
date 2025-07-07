import { geminiService } from "./geminiService";
import { chosenNicheService } from "./chosenNicheService";

class AgentService {
  async executeWorkflow(ideaBank = []) {
    const ideas = ideaBank.map(idea => idea.marketDiscovery.chosenMarket.niche);
    const chosenNiches = chosenNicheService.getChosenNiches();
    const excludedNiches = [...ideas, ...chosenNiches];

    const marketAnalysis = await this.runMarketAnalysis("AI-powered tools for developers", excludedNiches);

    chosenNicheService.saveChosenNiche(marketAnalysis.marketDiscovery.chosenMarket.niche);

    return marketAnalysis;
  }

  async runMarketAnalysis(prompt, excludedNiches = []) {
    let fullPrompt = `
      Analyze the market for a new product based on this idea: ${prompt}.
      Provide a detailed analysis covering:
      - Target Audience
      - Market Size
      - Competitors
      - Potential Challenges
      - Recommendations
    `;

    if (excludedNiches.length > 0) {
      fullPrompt += `\n\nPlease exclude the following niches from your analysis: ${excludedNiches.join(", ")}.`;
    }
    const response = await geminiService.generateContent(fullPrompt, false);
    return this.parseResponse(response);
  }

  parseResponse(response) {
    try {
      // Attempt to parse as JSON, if it fails, return as plain text.
      return JSON.parse(response);
    } catch (error) {
      return response;
    }
  }
}

export const agentService = new AgentService();