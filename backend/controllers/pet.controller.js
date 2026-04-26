import Pet from '../models/pet.model.js';
import Shelter from '../models/shelter.model.js';

export const getPublicPets = async (req, res) => {
    try {
        const { shelter } = req.query;
        if (!shelter) return res.status(400).json({ message: 'Shelter ID is required' });

        // Only return pets that are available for adoption
        const pets = await Pet.find({ 
            shelter: shelter, 
            adoptionStatus: 'Available' 
        }).sort({ createdAt: -1 });
        
        res.status(200).json(pets);
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
        if (!shelter) return res.status(404).json({ message: 'Shelter not found. Create a profile first.' });

        const newPet = new Pet({ ...req.body, shelter: shelter._id });
        const savedPet = await newPet.save();
        res.status(201).json(savedPet);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const updatePetStatus = async (req, res) => {
    try {
        const updatedPet = await Pet.findByIdAndUpdate(
            req.params.id, 
            { $set: req.body }, 
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
        const pet = await Pet.findByIdAndDelete(req.params.id);
        if (!pet) return res.status(404).json({ message: 'Pet not found' });
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