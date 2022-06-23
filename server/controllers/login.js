const tempdb = require('./tempdb');

const { OAuth2Client } = require('google-auth-library');

const config = require("../config/config.json");
const client = new OAuth2Client(config.google_client_id);

// TODO: replace with database

exports.post_login = async (req, res) => {
    const { token } = req.body;
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: config.google_client_id,
    });

    const { name, email } = ticket.getPayload(); // TODO: get any other info we need

    // TODO: store in db
    tempdb.setIsAuthenticated(true);

    // TODO: Very basic check for andrew email - currently used to determine 
    // whether you're a TA or not
    if (email.split('@')[1] === 'andrew.cmu.edu') {
        tempdb.setIsTA(true);
        tempdb.setIsAdmin(true);
    } else {
        tempdb.setIsTA(false);
        tempdb.setIsAdmin(false);
    }

    // TODO: get/generate token to give back to the client
	const user_token = jwt.sign(
		{
			name: name,
			email: email
		},
		process.env.TOKEN_KEY,
		{
			algorithm: 'HS256'
		}
	);

	tempdb.setAccessToken(user_token);

    res.status(201);
    res.json({ name: name, email: email, user_token: user_token });
};

exports.post_logout = (req, res) => {
    tempdb.setIsAuthenticated(false);
	tempdb.setAccessToken("");
    res.status(200);
};
