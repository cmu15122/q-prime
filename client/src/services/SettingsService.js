import http from "../http-common";

class SettingsDataService {
  getAll() {
    return http.get("/settings");
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
}

export default new SettingsDataService();
