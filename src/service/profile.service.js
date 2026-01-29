import http from "../http-common-profile";

class ProfileService {
  
  
  uploadProfileImage(userId, file) {
    const formData = new FormData();
    formData.append("file", file);

    return http.post(`/${userId}/profile-image`, formData, { 
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }

  getUser(userId) {
    return http.get(`/${userId}`); 
  }

}

export default new ProfileService();