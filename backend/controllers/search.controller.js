import { executeGlobalSearch } from '../services/search.service.js';

export const globalSearch = async (req, res) => {
    try {
        const { q, limit } = req.query;
        const parsedLimit = parseInt(limit, 10) || 12;
        const results = await executeGlobalSearch(q, parsedLimit);

        res.status(200).json(results);

    } catch (error) {
        console.error("Search API Error:", error);
        res.status(500).json({ message: 'Server error during search', error: error.message });
    }
};