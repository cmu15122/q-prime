// For metrics page
const tempdb = require('./tempdb');

const metricsView = (req, res) => {
    // TODO: use req to get access token and check for user status
    res.status(200);
    res.send({ 
        title: "15-122 Office Hours Queue | Metrics",
        isAuthenticated: tempdb.userInfo.isAuthenticated,
        isTA: tempdb.userInfo.isTA,
        isAdmin: tempdb.userInfo.isAdmin
    });
};

module.exports = metricsView;
