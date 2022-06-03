const SlackWebhook = require("slack-webhook");

const config = require('../config/config.json');
const webhook_url = config["slack-webhook"];

var slack = null;
var last_updated = new Date(0);

const ping_interval_secs = 30;

exports.init = function() {
    // Initialize slack based on webhook URL
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

    exports.update_wait_times();
    setInterval(function() {
        var prev_ping_time = new Date();
        prev_ping_time.setSeconds(prev_ping_time.getSeconds() - ping_interval_secs);

        if (last_updated < prev_ping_time) {
            exports.update_wait_times();
        }
    }, ping_interval_secs*1000);
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
