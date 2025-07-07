import chosenNiches from '../chosenNiches.json';

class ChosenNicheService {
  getChosenNiches() {
    return chosenNiches;
  }

  saveChosenNiche(niche) {
    const updatedNiches = [...chosenNiches, niche];
    // In a real app, this would be an API call to a backend service
    // that would handle writing to the file.
    // For now, we will just return the updated list.
    return updatedNiches;
  }
}

export const chosenNicheService = new ChosenNicheService();