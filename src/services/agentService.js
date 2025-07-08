import { geminiService } from "./geminiService";

class AgentService {
  async executeWorkflow(ideaBank = []) {
    const excludedNiches = ideaBank.map(idea => idea.marketDiscovery.chosenMarket.niche);
    console.log("Excluded niches:", excludedNiches);
    const marketAnalysis = await this.runMarketAnalysis("AI-powered tools for developers", excludedNiches);

    if (marketAnalysis) {
      ideaBank.push(marketAnalysis);
    }

    return marketAnalysis;
  }

  async runMarketAnalysis(prompt, excludedNiches = []) {
    const mockIdeas = [
      {
        marketDiscovery: {
          chosenMarket: {
            category: "Developer Tools",
            subcategory: "AI-powered",
            niche: "Code Generation",
            subNiche: "Test Automation",
            reasoning: "High demand for tools that can automate testing and improve developer productivity."
          },
        },
      },
      {
        marketDiscovery: {
          chosenMarket: {
            category: "Health and Wellness",
            subcategory: "AI-powered",
            niche: "Personalized Nutrition",
            subNiche: "Meal Planning",
            reasoning: "Growing interest in personalized health and wellness solutions."
          },
        },
      }
    ];

    const availableIdeas = mockIdeas.filter(idea => !excludedNiches.includes(idea.marketDiscovery.chosenMarket.niche));

    if (availableIdeas.length === 0) {
      return null;
    }

    return availableIdeas[0];
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