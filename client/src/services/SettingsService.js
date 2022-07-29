import http from "../http-common";

class SettingsDataService {
  getAll() {
    return http.get("/settings");
  }
  updateVideoChatSettings(data) {
    return http.post("/settings/videoChat/update", data);
  }
  updateNotifSettings(data) {
    return http.post("/settings/notifs/update", data);
  }
  createTopic(data) {
    return http.post("/settings/topics/create", data);
  }
  updateTopic(data) {
    return http.post("/settings/topics/update", data);
  }
  deleteTopic(data) {
    return http.post("/settings/topics/delete", data);
  }
  createTA(data) {
    return http.post("/settings/tas/create", data);
  }
  updateTA(data) {
    return http.post("/settings/tas/update", data);
  }
  deleteTA(data) {
    return http.post("/settings/tas/delete", data);
  }
  updateSemester(data) {
    return http.post("/settings/config/sem/update", data);
  }
  updateSlackURL(data) {
    return http.post("/settings/config/slack/update", data);
  }
  updateQuestionsURL(data) {
    return http.post("/settings/config/questions/update", data);
  }
  updateRejoinTime(data) {
    return http.post("/settings/config/rejoin/update", data);
  }
  updatePreferredName(data) {
    return http.post("/settings/preferredname/update", data);
  }
}

export default new SettingsDataService();
