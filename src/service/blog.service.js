import http from "../http-common-blog";

class BlogService {
  // ========== PUBLIC ENDPOINTS ==========

  /**
   * Get paginated published blog posts (default endpoint now uses pagination)
   */
  getAll(page = 0, size = 10) {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('size', size.toString());
    // Use empty string to avoid trailing slash issues
    return http.get('', { params: { page, size } });
  }

  /**
   * Get paginated published posts (explicit endpoint)
   */
  getPaginated(page = 0, size = 10) {
    return http.get(`/paginated?page=${page}&size=${size}`);
  }

  /**
   * Get post by slug
   */
  getBySlug(slug) {
    return http.get(`/${slug}`);
  }

  /**
   * Get featured posts
   */
  getFeatured() {
    return http.get("/featured");
  }

  /**
   * Get trending posts
   */
  getTrending() {
    return http.get("/trending");
  }

  /**
   * Get popular posts (top by views)
   */
  getPopular() {
    return http.get("/popular");
  }

  /**
   * Get recent posts
   */
  getRecent() {
    return http.get("/recent");
  }

  /**
   * Get posts by category
   */
  getByCategory(category) {
    return http.get(`/category/${encodeURIComponent(category)}`);
  }

  /**
   * Get posts by tag
   */
  getByTag(tag) {
    return http.get(`/tag/${encodeURIComponent(tag)}`);
  }

  /**
   * Get posts in a series
   */
  getSeries(seriesName) {
    return http.get(`/series/${encodeURIComponent(seriesName)}`);
  }

  /**
   * Search posts
   */
  search(query) {
    return http.get(`/search?q=${encodeURIComponent(query)}`);
  }

  /**
   * Get all categories
   */
  getCategories() {
    return http.get("/categories");
  }

  /**
   * Get all tags
   */
  getTags() {
    return http.get("/tags");
  }

  /**
   * Get category counts
   */
  getCategoryCounts() {
    return http.get("/categories/counts");
  }

  /**
   * Get blog statistics (total posts, total views, total categories)
   */
  getStats() {
    return http.get("/stats");
  }

  /**
   * Get related posts
   */
  getRelated(postId, category, limit = 3) {
    return http.get(`/${postId}/related?category=${encodeURIComponent(category)}&limit=${limit}`);
  }

  /**
   * Like a post
   */
  likePost(postId) {
    return http.post(`/${postId}/like`);
  }

  /**
   * Track share of a post
   */
  sharePost(postId) {
    return http.post(`/${postId}/share`);
  }

  // ========== ADMIN ENDPOINTS ==========

  /**
   * Get all posts including drafts (Admin) - DEPRECATED: Use paginated endpoint
   */
  getAllAdmin() {
    return http.get("/admin/all");
  }

  /**
   * Get paginated posts including drafts (Admin)
   */
  getAllAdminPaginated(page = 0, size = 10, search = null) {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('size', size);
    if (search) {
      params.append('search', search);
    }
    return http.get(`/admin/paginated?${params.toString()}`);
  }

  /**
   * Get post by ID (Admin)
   */
  getById(id) {
    return http.get(`/admin/${id}`);
  }

  /**
   * Create new post (Admin)
   */
  create(data) {
    return http.post("", data);
  }

  /**
   * Update post (Admin)
   */
  update(id, data) {
    return http.put(`/${id}`, data);
  }

  /**
   * Delete post (Admin)
   */
  delete(id) {
    return http.delete(`/${id}`);
  }

  /**
   * Toggle featured status (Admin)
   */
  toggleFeatured(id) {
    return http.post(`/${id}/toggle-featured`);
  }

  /**
   * Toggle published status (Admin)
   */
  togglePublished(id) {
    return http.post(`/${id}/toggle-published`);
  }

  // ========== LEGACY SUPPORT ==========

  /**
   * Get posts by category (legacy)
   */
  getPostsByCategory(category) {
    return this.getByCategory(category);
  }
}

export default new BlogService();
