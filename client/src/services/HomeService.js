import http from "../http-common";

class HomeDataService {
  getAll() {
    return http.get("/");
  }
  login(data) {
    return http.post("/login", data);
  }
  freezeQueue() {
    return http.post("/freezeQueue");
  }
  unfreezeQueue() {
    return http.post("/unfreezeQueue");
  }
  createAnnouncement(data) {
    return http.post("/announcements/create", data);
  }
  updateAnnouncement(data) {
    return http.post("/announcements/update", data);
  }
  deleteAnnouncement(data) {
    return http.post("/announcements/delete", data);
  }
  addQuestion(data) {
    return http.post("/addQuestion", data);
  }
  removeStudent(data) {
    return http.post("/removeStudent", data);
  }
  helpStudent(data) {
    return http.post("/helpStudent", data);
  }
  unhelpStudent(data) {
    return http.post("/unhelpStudent", data);
  }
  messageStudent(data) {
    return http.post("/messageStudent", data);
  }
  dismissMessage(data) {
    return http.post("/dismissMessage", data);
  }
  approveCooldownOverride(data) {
    return http.post("/approveCooldownOverride", data);
  }
  displayStudents() {
    return http.get("/displayStudents");
  }
}

export default new HomeDataService();
