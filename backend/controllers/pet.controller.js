import Pet from '../models/pet.model.js';
import Shelter from '../models/shelter.model.js';
import User from '../models/user.model.js';
import { generatePetRecommendations } from '../services/recommendation.service.js';
import { deleteImageFromCloudinary } from '../utils/cloudinary.util.js';

const processPetData = (reqBody) => {
    if (typeof reqBody.healthStatus === 'string') {
        reqBody.healthStatus = JSON.parse(reqBody.healthStatus);
    }
    if (reqBody.imageUrl) {
        reqBody.photos = [reqBody.imageUrl];
    }
    return reqBody;
};

export const getPublicPets = async (req, res) => {
    try {
        const { shelter, size, species } = req.query;
        let query = { adoptionStatus: 'Available' };

        if (shelter) query.shelter = shelter;
        if (size) query.size = size;
        if (species) query.species = species;

        const pets = await Pet.find(query).populate('shelter').sort({ createdAt: -1 });
        res.status(200).json(pets);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Recommendations
export const getRecommendations = async (req, res) => {
    try {
        const recommendedPets = await generatePetRecommendations(req.user._id);
        res.status(200).json(recommendedPets);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// --- USER ROUTES ---
export const getUserPets = async (req, res) => {
    try {
        const pets = await Pet.find({ owner: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json(pets);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const addUserPet = async (req, res) => {
    try {
        const processedData = processPetData(req.body);
        const newPet = new Pet({ 
            ...processedData, 
            owner: req.user._id,
            adoptionStatus: 'Available'
        });
        const savedPet = await newPet.save();
        res.status(201).json(savedPet);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const updateUserPet = async (req, res) => {
    try {
        const processedData = processPetData(req.body);
        const updatedPet = await Pet.findOneAndUpdate(
            { _id: req.params.id, owner: req.user._id },
            { $set: processedData },
            { new: true, runValidators: true }
        );
        if (!updatedPet) return res.status(404).json({ message: 'Pet not found or unauthorized' });
        res.status(200).json(updatedPet);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const deleteUserPet = async (req, res) => {
    try {
        const pet = await Pet.findOne({ _id: req.params.id, owner: req.user._id });
        if (!pet) return res.status(404).json({ message: 'Pet not found or unauthorized' });

        // Clean up Cloudinary images
        if (pet.photos && pet.photos.length > 0) {
            for (const photoUrl of pet.photos) {
                await deleteImageFromCloudinary(photoUrl);
            }
        }

        await pet.deleteOne();
        res.status(200).json({ message: 'Pet deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// --- SHELTER MANAGER ROUTES ---
export const getInventory = async (req, res) => {
    try {
        const shelter = await Shelter.findOne({ manager: req.user._id });
        if (!shelter) return res.status(404).json({ message: 'Shelter not found' });

        const pets = await Pet.find({ shelter: shelter._id }).sort({ createdAt: -1 });
        res.status(200).json(pets);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const addPet = async (req, res) => {
    try {
        const shelter = await Shelter.findOne({ manager: req.user._id });
        if (!shelter) return res.status(404).json({ message: 'Shelter not found.' });

        const processedData = processPetData(req.body);
        const newPet = new Pet({ ...processedData, shelter: shelter._id });
        const savedPet = await newPet.save();
        res.status(201).json(savedPet);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const updatePetStatus = async (req, res) => {
    try {
        const processedData = processPetData(req.body);
        const updatedPet = await Pet.findByIdAndUpdate(
            req.params.id, 
            { $set: processedData }, 
            { new: true, runValidators: true }
        );
        if (!updatedPet) return res.status(404).json({ message: 'Pet not found' });
        res.status(200).json(updatedPet);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const deletePet = async (req, res) => {
    try {
        const pet = await Pet.findById(req.params.id);
        if (!pet) return res.status(404).json({ message: 'Pet not found' });

        // Clean up Cloudinary images
        if (pet.photos && pet.photos.length > 0) {
            for (const photoUrl of pet.photos) {
                await deleteImageFromCloudinary(photoUrl);
            }
        }

        await pet.deleteOne();
        res.status(200).json({ message: 'Pet deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const bulkImportPets = async (req, res) => {
    try {
        const shelter = await Shelter.findOne({ manager: req.user._id });
        if (!shelter) return res.status(404).json({ message: 'Shelter not found' });

        const petsArray = req.body.pets.map(pet => ({
            ...pet,
            shelter: shelter._id
        }));

        const insertedPets = await Pet.insertMany(petsArray);
        res.status(201).json({ message: `${insertedPets.length} pets imported successfully`, data: insertedPets });
    } catch (error) {
        res.status(500).json({ message: 'Bulk import failed', error: error.message });
    }
};

export const getAllPetsAdmin = async (req, res) => {
    try {
        const pets = await Pet.find()
            .populate('shelter', 'organizationName city')
            .sort({ createdAt: -1 });
        res.status(200).json(pets);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const updatePetAdmin = async (req, res) => {
    try {
        const processedData = processPetData(req.body);
        const updatedPet = await Pet.findByIdAndUpdate(
            req.params.id,
            { $set: processedData },
            { new: true, runValidators: true }
        ).populate('shelter', 'organizationName city');
        
        if (!updatedPet) return res.status(404).json({ message: 'Pet not found' });
        res.status(200).json(updatedPet);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const deletePetAdmin = async (req, res) => {
    try {
        const pet = await Pet.findById(req.params.id);
        if (!pet) return res.status(404).json({ message: 'Pet not found' });

        // Clean up Cloudinary images
        if (pet.photos && pet.photos.length > 0) {
            for (const photoUrl of pet.photos) {
                await deleteImageFromCloudinary(photoUrl);
            }
        }

        await pet.deleteOne();
        res.status(200).json({ message: 'Pet deleted completely' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};