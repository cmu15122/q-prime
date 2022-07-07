const SlackWebhook = require("slack-webhook");

const settings = require('./settings');

var slack = null;

exports.init = function() {
    // Initialize slack based on webhook URL
    exports.update_slack();
};

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
