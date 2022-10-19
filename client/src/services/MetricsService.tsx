import http from '../http-common';

class MetricsDataService {
  getAll() {
    return http.get('/metrics');
  }
  getHelpedStudents() {
    return http.get('/metrics/helpedStudents');
  }
  getNumQuestionsAnswered() {
    return http.get('/metrics/numQuestionsAnswered');
  }
  getAverageTimePerQuestion() {
    return http.get('/metrics/averageTimePerQuestion');
  }
}

export default new MetricsDataService();
