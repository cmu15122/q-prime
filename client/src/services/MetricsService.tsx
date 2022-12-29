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

  getNumQuestions() {
    return http.get('/metrics/totalNumQuestions');
  }

  getAvgTimePerQuestion() {
    return http.get('/metrics/totalAvgTimePerQuestion');
  }

  getTotalAvgWaitTime() {
    return http.get('/metrics/totalAvgWaitTime');
  }

  getNumStudentsPerDayLastWeek() {
    return http.get('/metrics/numStudentsPerDayLastWeek');
  }

  getNumStudentsPerDay() {
    return http.get('/metrics/numStudentsPerDay');
  }
}

export default new MetricsDataService();
