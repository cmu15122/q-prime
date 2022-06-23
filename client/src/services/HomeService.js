import http from "../http-common";

class HomeDataService {
  getAll() {
    return http.get("/");
  }
}
export default new HomeDataService();
