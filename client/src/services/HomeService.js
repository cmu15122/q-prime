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
}

export default new HomeDataService();
