// For metrics page
const metricsView = (req, res) => {
    // TODO: use req to get access token and check for user status
    res.status(200);
    res.send({ 
        title: "15-122 Office Hours Queue | Metrics",
        isAuthenticated: true,
        isTA: true,
        isAdmin: true
    });
};

module.exports = metricsView;
