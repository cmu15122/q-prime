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

  getNumQuestionsToday() {
    return http.get('/metrics/numQuestionsToday');
  }

  getNumBadQuestions() {
    return http.get('/metrics/numBadQuestionsToday');
  }

  getAvgWaitTime() {
    return http.get('/metrics/avgWaitTimeToday');
  }

  getTaStudentRatio() {
    return http.get('/metrics/taStudentRatioToday');
  }
}

export default new MetricsDataService();
