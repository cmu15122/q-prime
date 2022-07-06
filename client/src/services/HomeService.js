import http from "../http-common";

class HomeDataService {
  getAll() {
    return http.get("/");
  }
  getStudent() {
    return http.get("/getStudent")
  }
  freezeQueue() {
    return http.post("/freezeQueue");
  }
  unfreezeQueue() {
    return http.post("/unfreezeQueue");
  }
  addQuestion(data) {
    return http.post("/addQuestion", data);
  }
  removeStudent(data) {
    return http.post("/removeStudent", data);
  }
}

export default new HomeDataService();
