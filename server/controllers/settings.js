// For settings page
const settingsView = (req, res) => {
    // TODO: use req to get access token and check for user status
    res.status(200);
    res.send({ 
        title: "15-122 Office Hours Queue | Settings",
        isAuthenticated: true,
        isTA: true,
        isAdmin: true
    });
};

module.exports = settingsView;
