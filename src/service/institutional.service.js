import http from "../http-common";

const createInstitution = (institutionName, institutionType, contactEmail, contactPhone) => {
  return http.post("/institutional/institutions", {
    institutionName,
    institutionType,
    contactEmail,
    contactPhone
  });
};

const getInstitutionById = (id) => {
  return http.get(`/institutional/institutions/${id}`);
};

const updateWhiteLabelSettings = (institutionId, logoUrl, primaryColor, secondaryColor, domain) => {
  return http.put(`/institutional/institutions/${institutionId}/white-label`, {
    logoUrl,
    primaryColor,
    secondaryColor,
    domain
  });
};

const createBatch = (institutionId, batchName, batchCode, gradeLevel, academicYear, teacherId) => {
  return http.post("/institutional/batches", {
    institutionId,
    batchName,
    batchCode,
    gradeLevel,
    academicYear,
    teacherId
  });
};

const getBatchesByInstitution = (institutionId) => {
  return http.get(`/institutional/batches/institution/${institutionId}`);
};

const addStudentToBatch = (batchId, studentId) => {
  return http.post(`/institutional/batches/${batchId}/students/${studentId}`);
};

const removeStudentFromBatch = (batchId, studentId) => {
  return http.delete(`/institutional/batches/${batchId}/students/${studentId}`);
};

const createLabSession = (institutionId, batchId, sessionName, testId) => {
  return http.post("/institutional/lab-sessions", {
    institutionId,
    batchId,
    sessionName,
    testId
  });
};

const startLabSession = (sessionCode) => {
  return http.post(`/institutional/lab-sessions/${sessionCode}/start`);
};

const joinLabSession = (sessionCode) => {
  return http.post(`/institutional/lab-sessions/${sessionCode}/join`);
};

const updateParticipantProgress = (sessionId, userId, wpm, accuracy) => {
  return http.put(`/institutional/lab-sessions/${sessionId}/participants/${userId}/progress`, {
    wpm,
    accuracy
  });
};

const getParticipants = (sessionId) => {
  return http.get(`/institutional/lab-sessions/${sessionId}/participants`);
};

const getActiveParticipants = (sessionId) => {
  return http.get(`/institutional/lab-sessions/${sessionId}/participants/active`);
};

const generateMarksheets = (batchId, testId) => {
  return http.post("/institutional/marksheets/generate", {
    batchId,
    testId
  });
};

const configureSSO = (institutionId, provider, clientId, clientSecret, redirectUri) => {
  return http.post("/institutional/sso/configure", {
    institutionId,
    provider,
    clientId,
    clientSecret,
    redirectUri
  });
};

const getSSOConfig = (institutionId) => {
  return http.get(`/institutional/sso/${institutionId}`);
};

const institutionalService = {
  createInstitution,
  getInstitutionById,
  updateWhiteLabelSettings,
  createBatch,
  getBatchesByInstitution,
  addStudentToBatch,
  removeStudentFromBatch,
  createLabSession,
  startLabSession,
  joinLabSession,
  updateParticipantProgress,
  getParticipants,
  getActiveParticipants,
  generateMarksheets,
  configureSSO,
  getSSOConfig
};

export default institutionalService;
