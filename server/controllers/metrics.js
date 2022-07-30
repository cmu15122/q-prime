// For metrics page
const metricsView = (req, res) => {
    // TODO: use req to get access token and check for user status
    res.status(200);

    if (req.user.isOwner) {
        let data = { isOwner: req.user.isOwner };
        res.send(data);
        return;
    }

    res.send({ 
        title: "15-122 Office Hours Queue | Metrics",
        isAuthenticated: req.user.isAuthenticated,
        isTA: req.user.isTA,
        isAdmin: req.user.isAdmin,
        andrewID: req.user?.andrewID,
        preferred_name: req.user?.account?.preferred_name
    });
};

module.exports = metricsView;
