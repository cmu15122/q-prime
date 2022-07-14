import http from "../http-common";

class HomeDataService {
  getAll() {
    return http.get("/");
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
  displayStudents(data) {
    return http.post("/displayStudents", data);
  }
}

export default new HomeDataService();
