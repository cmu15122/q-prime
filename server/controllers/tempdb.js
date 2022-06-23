// Temporary file acting as a database 

let userInfo = {
    isAuthenticated: false,
    isTA: false,
    isAdmin: false,
	accessToken: ""
}

exports.userInfo = userInfo;

exports.setIsAuthenticated = function (value) {
    userInfo.isAuthenticated = value;
}

exports.setIsTA = function (value) {
    userInfo.isTA = value;
}

exports.setIsAdmin = function (value) {
    userInfo.isAdmin = value;
}

exports.setAccessToken = function (value) {
	userInfo.accessToken = value;
}