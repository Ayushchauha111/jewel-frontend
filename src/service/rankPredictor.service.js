import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

/**
 * Service for Rank Predictor & Marks Calculator API
 * Follows Single Responsibility - handles only API calls
 */
class RankPredictorService {
    
    /**
     * Get all exams with optional filtering
     */
    async getExams(params = {}) {
        const { category, search, page = 0, size = 20 } = params;
        const queryParams = new URLSearchParams();
        
        if (category) queryParams.append('category', category);
        if (search) queryParams.append('search', search);
        queryParams.append('page', page);
        queryParams.append('size', size);
        
        const response = await axios.get(`${API_URL}/api/rank-predictor/exams?${queryParams}`);
        return response.data;
    }
    
    /**
     * Get featured exams
     */
    async getFeaturedExams() {
        const response = await axios.get(`${API_URL}/api/rank-predictor/exams/featured`);
        return response.data;
    }
    
    /**
     * Get popular exams
     */
    async getPopularExams(limit = 10) {
        const response = await axios.get(`${API_URL}/api/rank-predictor/exams/popular?limit=${limit}`);
        return response.data;
    }
    
    /**
     * Get categories with counts
     */
    async getCategories() {
        const response = await axios.get(`${API_URL}/api/rank-predictor/categories`);
        return response.data;
    }
    
    /**
     * Get exam by ID or code
     */
    async getExam(identifier) {
        const response = await axios.get(`${API_URL}/api/rank-predictor/exams/${identifier}`);
        return response.data;
    }
    
    /**
     * Calculate marks (quick calculation)
     */
    async calculateMarks(examId, correct, wrong, unattempted) {
        const response = await axios.post(`${API_URL}/api/rank-predictor/calculate`, {
            examId,
            correct,
            wrong,
            unattempted
        });
        return response.data;
    }
    
    /**
     * Calculate marks and predict rank
     */
    async predictRank(examId, correct, wrong, unattempted, category) {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        const response = await axios.post(`${API_URL}/api/rank-predictor/predict`, {
            examId,
            correct,
            wrong,
            unattempted,
            category
        }, { headers });
        
        return response.data;
    }
    
    /**
     * Get score distribution for an exam
     */
    async getScoreDistribution(examId) {
        const response = await axios.get(`${API_URL}/api/rank-predictor/exams/${examId}/distribution`);
        return response.data;
    }
    
    /**
     * Get leaderboard for an exam
     */
    async getLeaderboard(examId, limit = 50) {
        const response = await axios.get(`${API_URL}/api/rank-predictor/exams/${examId}/leaderboard?limit=${limit}`);
        return response.data;
    }
    
    // Admin methods
    async createExam(exam) {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${API_URL}/api/rank-predictor/admin/exams`, exam, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }
    
    async updateExam(id, exam) {
        const token = localStorage.getItem('token');
        const response = await axios.put(`${API_URL}/api/rank-predictor/admin/exams/${id}`, exam, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }
    
    async deleteExam(id) {
        const token = localStorage.getItem('token');
        const response = await axios.delete(`${API_URL}/api/rank-predictor/admin/exams/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }
}

export default new RankPredictorService();
