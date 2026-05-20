import mongoose from 'mongoose';
import Pet from '../models/pet.model.js';
import User from '../models/user.model.js';
import Event from '../models/event.model.js';
import Task from '../models/task.model.js';

export const generatePetRecommendations = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }

    // Find all events the user is attending and tasks they are volunteering for
    const [userEvents, userTasks] = await Promise.all([
        Event.find({ registeredAttendees: userId }).select('shelter').lean(),
        Task.find({ volunteer: userId }).select('shelter').lean()
    ]);

    // Extract shelter IDs, combine them, and remove duplicates
    const interactedShelterIds = [
        ...userEvents.map(e => e.shelter.toString()),
        ...userTasks.map(t => t.shelter.toString())
    ];
    
    // Convert back to ObjectIds for the MongoDB Aggregation pipeline
    const uniqueInteractedShelters = [...new Set(interactedShelterIds)].map(
        id => new mongoose.Types.ObjectId(id)
    );

    // Gather User's Preferences
    const prefs = user.searchPreferences || {};
    const preferredSpecies = prefs.preferredSpecies || [];
    const preferredSizes = prefs.preferredSizes || [];

    const pipeline = [
        // Filter down to available pets
        { $match: { adoptionStatus: 'Available' } },

        // Fetch shelter data
        {
            $lookup: {
                from: 'shelters',
                localField: 'shelter',
                foreignField: '_id',
                as: 'shelter'
            }
        },
        { $unwind: { path: '$shelter', preserveNullAndEmptyArrays: true } },
            
        // calculate the Recommendation Score for each pet
        {
            $addFields: {
                recommendationScore: {
                    $add: [
                        // Add 2 points if the species matches
                        { $cond: [{ $in: ["$species", preferredSpecies] }, 2, 0] },
                        
                        // Add 2 points if the size matches
                        { $cond: [{ $in: ["$size", preferredSizes] }, 2, 0] },
                        
                        // Add 5 points if the pet is at a shelter the user has interacted with
                        { $cond: [{ $in: ["$shelter._id", uniqueInteractedShelters] }, 5, 0] }
                    ]
                }
            }
        },

        // Sort by the highest score first. If there's a tie (e.g., score is 0), fall back to showing the newest pets.
        { $sort: { recommendationScore: -1, createdAt: -1 } },

        // Limit the results to 10
        { $limit: 10 }
    ];

    const recommendedPets = await Pet.aggregate(pipeline);
    
    return recommendedPets;
};