import Hospital from '../models/hospital.model.js';
import Shelter from '../models/shelter.model.js';
import Medicine from '../models/medicine.model.js';
import Pharmacy from '../models/pharmacy.model.js';

export const executeGlobalSearch = async (queryString, limit = 12) => {
    // If query is empty, return early to prevent full DB scans
    if (!queryString || queryString.trim() === '') {
        return { hospitals: [], shelters: [], medicines: [], pharmacies: [] };
    }

    // Tokenize the search query by spaces
    const tokens = queryString.trim().split(/\s+/);
    
    // create an array of case-insensitive regex patterns
    const regexTokens = tokens.map(token => new RegExp(token, 'i'));

    const buildSearchQuery = (fields) => {
        return {
            $and: regexTokens.map(regex => ({
                $or: fields.map(field => ({ [field]: regex }))
            }))
        };
    };

    // Define which fields to search for each model
    const hospitalQuery = buildSearchQuery(['name', 'city', 'address']);
    const shelterQuery = buildSearchQuery(['organizationName', 'city', 'description']);
    const medicineQuery = buildSearchQuery(['name', 'category', 'description']);
    const pharmacyQuery = buildSearchQuery(['name', 'city', 'address']);

    // Execute queries concurrently using .lean()
    const [hospitals, shelters, medicines, pharmacies] = await Promise.all([
        Hospital.find(hospitalQuery).limit(limit).lean(),
        Shelter.find(shelterQuery).limit(limit).lean(),
        Medicine.find(medicineQuery).populate('pharmacy', 'name city address hours contact').limit(limit + 3).lean(),
        Pharmacy.find(pharmacyQuery).limit(limit).lean()
    ]);

    return { hospitals, shelters, medicines, pharmacies };
};