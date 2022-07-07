const SlackWebhook = require("slack-webhook");

const settings = require('./settings');

var slack = null;

exports.init = function() {
    // Initialize slack based on webhook URL
    exports.update_slack();
};

// TODO: not sure if this function should be in the slack controller, feels like 
// something we do in queue/wherever we eventually store wait times
exports.update_wait_times = function() {
    var now = new Date();

    // TODO: Get current wait time
    // TODO: send wait time message
    // exports.send_message("<!channel> Help! Honk is on fire! Save him! :everythingsfineparrot:");
    last_updated = now;
}

exports.send_message = function(message) {
    if (slack) {
        slack.send(message);
    }
}

exports.update_slack = function() {
    let webhook_url = settings.get_admin_settings().slackURL;
    if (webhook_url && webhook_url != "") {
        slack = new SlackWebhook(webhook_url, {
            defaults: {
                "username": "QueueBot",
                // "icon_url": TODO: set icon
            }
        });
    } else {
        slack = null;
    }
}
