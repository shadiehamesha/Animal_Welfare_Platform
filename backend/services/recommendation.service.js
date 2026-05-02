import Pet from '../models/pet.model.js';
import User from '../models/user.model.js';

export const generatePetRecommendations = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }

    const prefs = user.searchPreferences;

    // Base query: all available pets
    let query = { adoptionStatus: 'Available' };
    
    // If user has preferences, boost results matching those preferences
    if (prefs && (prefs?.preferredSpecies?.length > 0 || prefs?.preferredSizes?.length > 0)) {
        query.$or = [];
        if (prefs?.preferredSpecies?.length > 0) {
            query.$or.push({ species: { $in: prefs.preferredSpecies } });
        }
        if (prefs?.preferredSizes?.length > 0) {
            query.$or.push({ size: { $in: prefs.preferredSizes } });
        }
    }

    // Fetch and return the recommended pets
    const recommendedPets = await Pet.find(query).limit(10).sort({ createdAt: -1 });
    return recommendedPets;
};