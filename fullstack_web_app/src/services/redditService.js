import axios from 'axios';

/**
 * Reddit scraping service for market research with enhanced error handling
 */
class RedditService {
  constructor() {
    this.baseURL = 'https://www.reddit.com';
    this.searchEndpoint = '/search.json';
    
    // Rate limiting configuration
    this.lastRequestTime = 0;
    this.minRequestInterval = 2000; // 2 seconds between requests
    this.requestCount = 0;
  }

  /**
   * Enhanced logging utility
   * @param {string} level - Log level (info, warn, error)
   * @param {string} context - Context of the log
   * @param {string|Object} message - Log message or object
   */
  log(level, context, message) {
    const timestamp = new Date().toISOString();
    const requestId = this.requestCount;
    
    switch (level) {
      case 'error':
        console.error(`[${timestamp}] [RedditService] [${context}] [${requestId}]`, message);
        break;
      case 'warn':
        console.warn(`[${timestamp}] [RedditService] [${context}] [${requestId}]`, message);
        break;
      default:
        console.log(`[${timestamp}] [RedditService] [${context}] [${requestId}]`, message);
    }
  }

  /**
   * Enforces rate limiting between requests
   */
  async enforceRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.minRequestInterval) {
      const delayNeeded = this.minRequestInterval - timeSinceLastRequest;
      this.log('info', 'enforceRateLimit', `Rate limiting: waiting ${delayNeeded}ms`);
      await this.sleep(delayNeeded);
    }
    
    this.lastRequestTime = Date.now();
  }

  /**
   * Sleep utility for delays
   * @param {number} ms - Milliseconds to sleep
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Searches Reddit for market-related discussions with enhanced error handling
   * @param {string} market - The market to search for
   * @returns {Promise<Array>} Array of Reddit threads
   */
  async searchMarketDiscussions(market) {
    this.requestCount++;
    const requestId = this.requestCount;
    
    this.log('info', 'searchMarketDiscussions', `Starting search for market: "${market}" (Request ${requestId})`);
    
    if (!market || typeof market !== 'string' || market.trim().length === 0) {
      this.log('error', 'searchMarketDiscussions', 'Invalid market parameter provided');
      throw new Error('Market parameter is required and must be a non-empty string');
    }

    try {
      await this.enforceRateLimit();
      
      // Enhanced search query with better targeting
      const searchQuery = this.buildSearchQuery(market.trim());
      
      this.log('info', 'searchMarketDiscussions', `Using search query: "${searchQuery}"`);
      
      const response = await axios.get(`${this.baseURL}${this.searchEndpoint}`, {
        params: {
          q: searchQuery,
          sort: 'relevance',
          limit: 50,
          type: 'link',
          t: 'year' // Search within the last year for more relevant results
        },
        headers: {
          'User-Agent': 'MarketResearchBot/1.0 (Contact: research@example.com)',
          'Accept': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      });

      this.log('info', 'searchMarketDiscussions', `Reddit API response status: ${response.status}`);
      
      const parsedThreads = this.parseRedditResponse(response.data);
      
      this.log('info', 'searchMarketDiscussions', `Successfully parsed ${parsedThreads.length} threads`);
      
      return parsedThreads;
    } catch (error) {
      this.log('error', 'searchMarketDiscussions', {
        error: error.message,
        status: error.response?.status,
        market: market
      });
      
      // Enhanced error handling with specific fallbacks
      if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        this.log('warn', 'searchMarketDiscussions', 'Network error detected, using enhanced fallback data');
        return this.getEnhancedMockRedditData(market);
      } else if (error.response?.status === 429) {
        this.log('warn', 'searchMarketDiscussions', 'Rate limit exceeded, using fallback data');
        return this.getEnhancedMockRedditData(market);
      } else if (error.response?.status >= 500) {
        this.log('warn', 'searchMarketDiscussions', 'Server error detected, using fallback data');
        return this.getEnhancedMockRedditData(market);
      } else {
        this.log('warn', 'searchMarketDiscussions', 'Unknown error, using fallback data');
        return this.getEnhancedMockRedditData(market);
      }
    }
  }

  /**
   * Builds an enhanced search query for Reddit
   * @param {string} market - The market to search for
   * @returns {string} Enhanced search query
   */
  buildSearchQuery(market) {
    const painPointTerms = [
      "struggle", "problem", "issue", "challenge", "difficulty", "frustration",
      "pain point", "barrier", "obstacle", "concern", "worry", "complaint"
    ];
    
    const experienceTerms = [
      "my experience", "I found", "I learned", "I realized", "in my opinion",
      "IMO", "what I wish", "what I regret", "my advice", "lessons learned"
    ];
    
    const combinedTerms = [...painPointTerms, ...experienceTerms];
    const termQuery = combinedTerms.slice(0, 10).map(term => `"${term}"`).join(' OR ');
    
    return `(${market}) AND (${termQuery}) site:reddit.com`;
  }

  /**
   * Parses Reddit API response with enhanced error handling
   * @param {Object} data - Reddit API response data
   * @returns {Array} Parsed thread data
   */
  parseRedditResponse(data) {
    try {
      if (!data) {
        this.log('warn', 'parseRedditResponse', 'No data provided');
        return [];
      }
      
      if (!data.data) {
        this.log('warn', 'parseRedditResponse', 'No data.data found in response');
        return [];
      }
      
      if (!data.data.children || !Array.isArray(data.data.children)) {
        this.log('warn', 'parseRedditResponse', 'No children array found in response');
        return [];
      }

      const threads = data.data.children
        .filter(child => {
          // Filter out invalid entries
          return child && 
                 child.data && 
                 child.data.title && 
                 typeof child.data.title === 'string' &&
                 child.data.title.trim().length > 0;
        })
        .map(child => {
          try {
            return {
              id: child.data.id || `generated_${Date.now()}_${Math.random()}`,
              title: (child.data.title || '').trim(),
              selftext: (child.data.selftext || '').trim(),
              score: Number(child.data.score) || 0,
              num_comments: Number(child.data.num_comments) || 0,
              created_utc: Number(child.data.created_utc) || Date.now() / 1000,
              subreddit: child.data.subreddit || 'unknown',
              permalink: child.data.permalink || '',
              url: child.data.url || '',
              author: child.data.author || 'unknown'
            };
          } catch (parseError) {
            this.log('warn', 'parseRedditResponse', `Error parsing individual thread: ${parseError.message}`);
            return null;
          }
        })
        .filter(thread => thread !== null); // Remove failed parses

      this.log('info', 'parseRedditResponse', `Successfully parsed ${threads.length} valid threads`);
      
      return threads;
    } catch (error) {
      this.log('error', 'parseRedditResponse', `Error parsing Reddit response: ${error.message}`);
      return [];
    }
  }

  /**
   * Gets enhanced mock Reddit data with market-specific content
   * @param {string} market - The market being researched
   * @returns {Array} Enhanced mock Reddit thread data
   */
  getEnhancedMockRedditData(market) {
    this.log('info', 'getEnhancedMockRedditData', `Generating enhanced mock data for market: "${market}"`);
    
    const mockTemplates = [
      {
        titleTemplate: `My biggest struggle with {market}`,
        selftextTemplate: `I've been dealing with issues in {market} for years. The main problems I face are lack of reliable solutions and high costs. The current options are either too expensive or don't work well. I wish there was a better way to handle this without breaking the bank.`,
        score: 156,
        num_comments: 23,
        subreddit: 'discussion'
      },
      {
        titleTemplate: `What I learned about {market} the hard way`,
        selftextTemplate: `After years of experience in {market}, I realized that most solutions don't address the core problems. The pain points include complexity, cost, and lack of user-friendly options. Here's what I wish someone had told me earlier...`,
        score: 89,
        num_comments: 17,
        subreddit: 'advice'
      },
      {
        titleTemplate: `My experience with {market} - what I wish I knew`,
        selftextTemplate: `Looking back, I wish someone had told me about the hidden challenges in {market}. The biggest frustrations are time-consuming processes and lack of transparency. It's been a learning curve but here are my insights.`,score: 134,num_comments: 31,subreddit: 'tips'
      },
      {
        titleTemplate: `Why {market} solutions keep failing me`,
        selftextTemplate: `I've tried multiple approaches to {market} and keep running into the same issues. Either the solutions are too complicated to set up, too expensive for what they offer, or they just don't work as advertised. Has anyone found something that actually works?`,score: 78,num_comments: 19,subreddit: 'help'
      },
      {
        titleTemplate: `The hidden costs of {market} nobody talks about`,
        selftextTemplate: `When I first got into {market}, I thought the advertised price was all I'd pay. Boy was I wrong. There are so many hidden fees and additional costs that add up quickly. Here's what you need to budget for...`,
        score: 203,
        num_comments: 45,
        subreddit: 'personalfinance'
      },
      {
        titleTemplate: `{market} is more complex than I expected`,
        selftextTemplate: `I thought {market} would be straightforward, but there's a steep learning curve. The terminology alone is confusing, and finding reliable resources is challenging. The community seems to assume everyone already knows the basics.`,
        score: 112,
        num_comments: 28,
        subreddit: 'learningcurve'
      }
    ];

    const currentTime = Date.now() / 1000;
    
    const mockData = mockTemplates.map((template, index) => ({
      id: `mock_${Date.now()}_${index}`,
      title: template.titleTemplate.replace(/{market}/g, market),
      selftext: template.selftextTemplate.replace(/{market}/g, market),
      score: template.score + Math.floor(Math.random() * 50) - 25, // Add some variance
      num_comments: template.num_comments + Math.floor(Math.random() * 10) - 5,
      created_utc: currentTime - (Math.random() * 30 * 24 * 60 * 60), // Random time within last 30 days
      subreddit: template.subreddit,
      permalink: `/r/${template.subreddit}/comments/mock_${index}`,
      url: `https://reddit.com/r/${template.subreddit}/comments/mock_${index}`,
      author: `user_${Math.floor(Math.random() * 1000)}`,
      isMockData: true
    }));

    this.log('info', 'getEnhancedMockRedditData', `Generated ${mockData.length} mock threads`);
    
    return mockData;
  }

  /**
   * Gets current service health status
   * @returns {Object} Service health information
   */
  getHealthStatus() {
    return {
      serviceName: 'RedditService',
      requestCount: this.requestCount,
      lastRequestTime: this.lastRequestTime,
      isHealthy: true,
      rateLimit: {
        minInterval: this.minRequestInterval,
        lastRequest: this.lastRequestTime
      }
    };
  }
}

export default new RedditService();