import http from "../http-common";

const getAllAdventureMaps = () => {
  return http.get("/junior/adventure-maps");
};

const getAdventureMapById = (id) => {
  return http.get(`/junior/adventure-maps/${id}`);
};

const getWorldsByMap = (mapId) => {
  return http.get(`/junior/worlds/map/${mapId}`);
};

const getWorldById = (id) => {
  return http.get(`/junior/worlds/${id}`);
};

const isWorldUnlocked = (worldId) => {
  return http.get(`/junior/worlds/${worldId}/unlock-status`).catch(error => {
    // If API fails, return unlocked=true for graceful degradation
    console.warn('Unlock check failed, allowing access:', error);
    return { data: { success: true, data: { unlocked: true, message: 'Access granted' } } };
  });
};

const getLessonsByWorld = (worldId) => {
  return http.get(`/junior/lessons/world/${worldId}`);
};

const getLessonById = (id) => {
  return http.get(`/junior/lessons/${id}`);
};

const getLessonNarrative = (lessonId, language = "ENGLISH") => {
  return http.get(`/junior/lessons/${lessonId}/narrative`, {
    params: { language }
  });
};

const updateProgress = (lessonId, wpm, accuracy, completed) => {
  return http.post("/junior/progress", {
    lessonId,
    wpm,
    accuracy,
    completed
  });
};

const getUserProgress = () => {
  return http.get("/junior/progress");
};

const getUserBadges = () => {
  return http.get("/junior/badges");
};

const getUserStats = () => {
  return http.get("/junior/stats");
};

const linkParent = (parentEmail, parentPhone, parentName, relationship) => {
  return http.post("/junior/parent-link", {
    parentEmail,
    parentPhone,
    parentName,
    relationship
  });
};

const generateProgressCard = () => {
  return http.get("/junior/progress-card");
};

const getAllDigitalCitizenshipLessons = () => {
  return http.get("/junior/digital-citizenship");
};

const getDigitalCitizenshipLessonById = (id) => {
  return http.get(`/junior/digital-citizenship/${id}`);
};

const juniorService = {
  getAllAdventureMaps,
  getAdventureMapById,
  getWorldsByMap,
  getWorldById,
  isWorldUnlocked,
  getLessonsByWorld,
  getLessonById,
  getLessonNarrative,
  updateProgress,
  getUserProgress,
  getUserBadges,
  getUserStats,
  linkParent,
  generateProgressCard,
  getAllDigitalCitizenshipLessons,
  getDigitalCitizenshipLessonById
};

export default juniorService;
