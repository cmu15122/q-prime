const home = require("./home");

let slack = require("./slack");
var sockets = require("./sockets");

let last_updated = new Date(0);
const ping_interval_secs = 30;
const ping_threshold_mins = 30;

let waittime = 0;

exports.init = function() {
    exports.update_wait_times();
    setInterval(function() {
        var prev_ping_time = new Date();
        prev_ping_time.setSeconds(prev_ping_time.getSeconds() - ping_interval_secs);

        if (last_updated < prev_ping_time) {
            exports.update_wait_times();
            last_updated = new Date();
        }
    }, ping_interval_secs*1000);
};

exports.update_wait_times = function() {
    waittime = home.getOHQ().size() * 2; //TODO: replace with actual waittime calculations
    sockets.waittimes(waittime);

    if (waittime > ping_threshold_mins) {
        slack.send_message("<!channel> Help! Honk is on fire! Save him! :everythingsfineparrot:");
    }
};

exports.get = function() {
    return waittime;
};
