const { OAuth2Client } = require('google-auth-library');

const config = require("../config/config.json");
const client = new OAuth2Client(config.google_client_id);

// TODO: replace with database

const login = async (req, res) => {
    const { token } = req.body;
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: config.google_client_id,
    });

    const { name, email } = ticket.getPayload(); // TODO: get any other info we need

    // TODO: store in db
    // TODO: get/generate token to give back to the client

    res.status(201);
    res.json({ name: name, email: email });
};

module.exports = login;
