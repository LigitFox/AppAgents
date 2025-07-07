import { authService } from "./authService";

class UserService {
  getIdeas() {
    const user = authService.getCurrentUser();
    if (!user) return [];

    const ideasJSON = localStorage.getItem(`ideas_${user.id}`);
    if (!ideasJSON) return [];

    let ideas;
    try {
      const parsed = JSON.parse(ideasJSON);
      if (!Array.isArray(parsed)) {
        // Data is not an array, clear it and start fresh.
        localStorage.removeItem(`ideas_${user.id}`);
        return [];
      }
      ideas = parsed;
    } catch (e) {
      // If data is corrupted, clear it and start fresh.
      localStorage.removeItem(`ideas_${user.id}`);
      return [];
    }

    const cleanedIdeas = ideas
      .map((idea) => {
        if (!idea) return null;
        if (typeof idea === "string") {
          return { name: idea, content: idea };
        }
        if (typeof idea === "object" && idea.name && typeof idea.name === 'string' && idea.content && typeof idea.content === 'string') {
          return idea;
        }
        return null;
      })
      .filter(Boolean);

    if (cleanedIdeas.length !== ideas.length) {
      localStorage.setItem(`ideas_${user.id}`, JSON.stringify(cleanedIdeas));
    }

    return cleanedIdeas;
  }

  saveIdea(ideaContent) {
    const user = authService.getCurrentUser();
    if (!user) return this.getIdeas();

    const ideas = this.getIdeas();

    if (ideas.some((idea) => idea.content === ideaContent)) {
      return ideas;
    }

    let name = ideaContent;
    try {
      const parsed = JSON.parse(ideaContent);
      if (parsed.strategy && parsed.strategy.solutions && parsed.strategy.solutions.length > 0 && parsed.strategy.solutions[0].name) {
        name = parsed.strategy.solutions[0].name;
      } else if (parsed.marketDiscovery && parsed.marketDiscovery.chosenMarket && parsed.marketDiscovery.chosenMarket.niche) {
        name = `Idea for: ${parsed.marketDiscovery.chosenMarket.niche}`;
      }
    } catch (e) {
      // not a json
    }

    if (name.length > 100) {
      name = name.substring(0, 97) + "...";
    }

    const newIdea = { name, content: ideaContent };
    const updatedIdeas = [...ideas, newIdea];
    localStorage.setItem(`ideas_${user.id}`, JSON.stringify(updatedIdeas));
    return updatedIdeas;
  }
}

export const userService = new UserService();