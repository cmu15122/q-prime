// For metrics page
const metricsView = (req, res) => {
    // TODO: use req to get access token and check for user status
    res.status(200);
    res.send({ 
        title: "15-122 Office Hours Queue | Metrics",
        isAuthenticated: req.user.isAuthenticated,
        isTA: req.user.isTA,
        isAdmin: req.user.isAdmin
    });
};

module.exports = metricsView;
