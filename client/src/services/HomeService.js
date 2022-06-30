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
  addQuestion(data) {
    return http.post("/addQuestion", data);
  }
}

export default new HomeDataService();
