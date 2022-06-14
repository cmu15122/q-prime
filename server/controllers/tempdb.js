// Temporary file acting as a database 

let userInfo = {
    isAuthenticated: false,
    isTA: false,
    isAdmin: false
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