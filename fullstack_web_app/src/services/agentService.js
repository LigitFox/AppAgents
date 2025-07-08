import { geminiService } from "./geminiService";

class AgentService {
  async executeWorkflow(ideaBank = []) {
    const excludedNiches = ideaBank.map(idea => idea.marketDiscovery?.chosenMarket?.niche).filter(Boolean);

    // 1. Market Discovery Agent
    const marketDiscovery = await this.runMarketDiscoveryAgent(excludedNiches);

    // 2. Research Agent
    const research = await this.runResearchAgent(marketDiscovery?.chosenMarket);

    // 3. Pain Point Analysis Agent
    const analysis = await this.runPainPointAnalysisAgent(research);

    // 4. Strategy Agent
    const strategy = await this.runStrategyAgent(analysis);

    return {
      marketDiscovery,
      research,
      analysis,
      strategy
    };
  }

  async runMarketDiscoveryAgent(excludedNiches = []) {
    const prompt = `
You are a business strategy and market segmentation expert. Your task is to:
1. Select ONE unique niche (not previously chosen) from the core markets Health, Wealth, or Relationships.
2. Output a JSON object with the following structure:
{
  "chosenMarket": {
    "coreMarket": "[Health|Wealth|Relationships]",
    "category": "[Category]",
    "subcategory": "[Subcategory]",
    "niche": "[Niche]",
    "subNiche": "[Sub-Niche]",
    "reasoning": "[Why this niche was selected and why it is unique]"
  },
  "categories": [
    {
      "main": "[Category]",
      "subcategories": ["[Subcategory1]", "[Subcategory2]", ...]
    }
    // as many as you can
  ]
}
Rules:
- Do NOT select any niche from this exclusion list: ${excludedNiches.length > 0 ? excludedNiches.join(", ") : "None"}
- Do NOT ask the user for input, just select and output the JSON.
- All fields must be filled. Do not leave any blank.
- The output must be valid JSON, with no extra text before or after.
Begin now.
`;
    const response = await geminiService.generateContent(prompt, false);
    return this.parseResponse(response);
  }

  async runResearchAgent(chosenMarket) {
    // Use the chosen market/niche for the search query
    const marketToExplore = chosenMarket?.niche || "Health";
    const prompt = `
You are a research agent. Your task is to generate a Reddit search query for the following market or niche:
"${marketToExplore}" (
   site:reddit.com
   inurl:comments|inurl:thread
   | intext:"I think"|"I feel"|"I was"|"I have been"|"I experienced"|"my experience"|"in my opinion"|"IMO"|
   "my biggest struggle"|"my biggest fear"|"I found that"|"I learned"|"I realized"|"my advice"|
   "struggles"|"problems"|"issues"|"challenge"|"difficulties"|"hardships"|"pain point"|
   "barriers"|"obstacles"|"concerns"|"frustrations"|"worries"|"hesitations"|"what I wish I knew"|"what I regret"
)
Return only the search query string, nothing else.
`;
    const response = await geminiService.generateContent(prompt, false);
    return { query: response };
  }

  async runPainPointAnalysisAgent(research) {
    const prompt = `
I'm analyzing Reddit conversations to identify common pain points and problems within a specific market. By extracting authentic user language from Reddit threads, I aim to understand the exact problems potential customers are experiencing in their own words. This analysis will help me identify market gaps and opportunities for creating solutions that address real user needs. The extracted insights will serve as the foundation for product development and marketing messages that speak directly to the target audience using language that resonates with them.

Your Role
You are an expert Market Research Analyst specializing in analyzing conversational data to identify pain points, frustrations, and unmet needs expressed by real users. Your expertise is in distilling lengthy Reddit threads into clear, actionable insights while preserving the authentic language users employ to describe their problems.

Your Mission
Carefully analyze provided Reddit conversations and comments
Identify distinct pain points, problems, and frustrations mentioned by users
Extract and organize these pain points into clear categories
For each pain point, include all direct quotes from users that best illustrate this specific problem
Extract EVERY valuable pain point - thoroughness is crucial

Analysis Criteria
INCLUDE:
Specific problems users are experiencing (e.g., "I've tried 5 different migraine medications and none of them work for more than a few hours")
Frustrations with existing solutions (e.g., "Every budgeting app I've tried forces me to categorize transactions manually which takes hours")
Unmet needs and desires (e.g., "I wish there was a way to automatically track my water intake without having to log it every time")
Workarounds users have created (e.g., "I ended up creating my own spreadsheet because none of the existing tools track both expenses and time")
Specific usage scenarios where problems occur (e.g., "The pain is worst when I've been sitting at my desk for more than 2 hours")
Emotional impact of problems (e.g., "The constant back pain has made it impossible to play with my kids, which is devastating")

DO NOT INCLUDE:
General discussion not related to problems or pain points
Simple questions asking for advice without describing a problem
Generic complaints without specific details
Positive experiences or success stories (unless they contrast with a problem)
Discussions about news, politics, or other topics unrelated to personal experiences

Output Format
Pain Point Analysis Summary: Begin with a brief overview of the major pain points identified across the data
Categorized Pain Points: Organize findings into clear thematic categories (e.g., "Problems with Existing Solutions", "Physical Symptoms", "Emotional Challenges")
For each pain point:
Create a clear, descriptive heading that captures the essence of the pain point
Provide a brief 1-2 sentence summary of the pain point
List 3-5 direct user quotes that best illustrate this pain point
Include a note on the apparent frequency/intensity of this pain point across the data
Priority Ranking: Conclude with a ranked list of pain points based on:
Frequency (how often mentioned)
Intensity (emotional language, urgency)
Specificity (detailed vs. vague)
Potential solvability (could a product or service address this?)

Paste your Reddit data below:
${research.query}
`;
    const response = await geminiService.generateContent(prompt, false);
    return this.parseResponse(response);
  }

  async runStrategyAgent(analysis) {
    const prompt = `
I've identified specific pain points within a market through research and customer feedback. Now I need to generate potential business solutions that address these pain points while creating unique value. Rather than rushing to an obvious solution, I want to systematically explore different approaches to solving these problems in ways that could stand out in the market. The goal is to discover opportunities others might miss by considering various dimensions of differentiation and value creation.

Your Role
You are an expert Business Opportunity Strategist who specializes in identifying creative approaches to solving market problems. Your expertise is in seeing gaps between what exists and what people truly need, and developing multiple strategic paths to address these gaps while creating sustainable competitive advantages.

Your Mission
Analyze the provided market pain points
Generate potential solutions using multiple strategic frameworks
Consider both capturing existing demand and creating new demand
Evaluate each solution for its potential to be "best in its category"
Identify unique angles and differentiators for each solution
Present a comprehensive yet practical set of business opportunities

Solution Frameworks to Apply
1. Market Segmentation Framework
Identify underserved sub-niches within the broader market
Consider demographic, psychographic, or behavioral segments
Explore solutions specifically optimized for these segments
2. Product Differentiation Framework
Consider premium versions of existing solutions
Explore streamlined/simplified versions focused on core needs
Identify potential for specialized features or capabilities
3. Business Model Innovation Framework
Explore subscription vs. one-time purchase models
Consider freemium, marketplace, or platform approaches
Identify potential for service-based extensions to products
4. Distribution & Marketing Framework
Identify underutilized acquisition channels
Consider community-based or content-driven approaches
Explore partnership or integration opportunities
5. New Paradigm Framework
Consider applications of emerging technologies
Identify relevant new trends, regulations, or data sources
Explore potential for creating entirely new categories

Output Format
Executive Summary: Brief overview of the identified market opportunity and key solution themes
For each framework, provide:
2-3 specific solution concepts
Key differentiators for each concept
Target audience specifics
Potential challenges to overcome
"Best in the world" potential assessment
For each solution concept, include:
Clear descriptive name
2-3 sentence explanation
Key features or components
Primary value proposition
Potential business model
How it specifically addresses identified pain points
Opportunity Assessment: Conclude with a ranked evaluation of the top 3 solutions based on:
Market size and growth potential
Competitive advantage sustainability
Implementation feasibility
Potential for category dominance ("best in the world" potential)
${typeof analysis === "string" ? analysis : JSON.stringify(analysis)}
`;
    const response = await geminiService.generateContent(prompt, false);
    return this.parseResponse(response);
  }

  async runMarketAnalysis(prompt, excludedNiches = []) {
    let fullPrompt = `
You are a business strategy and market segmentation expert. Your task is to:
1. Select ONE unique niche (not previously chosen) from the core markets Health, Wealth, or Relationships.
2. Output a JSON object with the following structure:
{
  "chosenMarket": {
    "coreMarket": "[Health|Wealth|Relationships]",
    "category": "[Category]",
    "subcategory": "[Subcategory]",
    "niche": "[Niche]",
    "subNiche": "[Sub-Niche]",
    "reasoning": "[Why this niche was selected and why it is unique]"
  },
  "categories": [
    {
      "main": "[Category]",
      "subcategories": ["[Subcategory1]", "[Subcategory2]", ...]
    }
    // as many as you can
  ]
}
Rules:
- Do NOT select any niche from this exclusion list: ${excludedNiches.length > 0 ? excludedNiches.join(", ") : "None"}
- Do NOT ask the user for input, just select and output the JSON.
- All fields must be filled. Do not leave any blank.
- The output must be valid JSON, with no extra text before or after.

Begin now.
`;

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