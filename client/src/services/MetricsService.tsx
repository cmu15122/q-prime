import http from "../http-common";

class MetricsDataService {
  getAll() {
    return http.get("/metrics");
  }
}

export default new MetricsDataService();
