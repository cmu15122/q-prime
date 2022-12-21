const models = require("./models");
const config = require("./config/config");

models.sequelize.authenticate().then(() => {
    console.log("Connected to the database!");
    return models.sequelize.sync();
}).then(() => {
    console.log("Synced with the database!");
}).catch(err => {
    console.log("An error occurred while syncing the database: ", err);
    process.exit();
});
