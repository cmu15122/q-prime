const models = require("./models");
const config = require("./config/config");

// Parse command line arguments
const args = process.argv.slice(2);
let alterOption = false; // default value

for (const arg of args) {
    if (arg.startsWith('--alter=')) {
        const value = arg.split('=')[1];
        alterOption = value === 'true';
        break;
    }
}

models.sequelize.authenticate().then(() => {
    console.log("Connected to the database!");
    console.log(`Syncing with alter option: ${alterOption}`);
    return models.sequelize.sync({ alter: alterOption });
}).then(() => {
    console.log(`Synced with the database! (alter: ${alterOption})`);
}).catch(err => {
    console.log("An error occurred while syncing the database: ", err);
    process.exit();
});
