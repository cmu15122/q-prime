// For settings page
const tempdb = require('./tempdb');

const settingsView = (req, res) => {
    // TODO: use req to get access token and check for user status
    res.status(200);
    res.send({ 
        title: "15-122 Office Hours Queue | Settings",
        isAuthenticated: tempdb.userInfo.isAuthenticated,
        isTA: tempdb.userInfo.isTA,
        isAdmin: tempdb.userInfo.isAdmin
    });
};

module.exports = settingsView;
