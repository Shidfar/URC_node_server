/**
 * Created by shidfar on 11/2/16.
 */
var mqtt = require('mqtt');
var sl = require('sleep');
var client = mqtt.connect({host: '192.168.0.2', port: 1883});
var callbacks = [];

client.on('connect', function () {
    client.subscribe('/pub/#');
    client.publish('/pub/bbS/', 'Hello mqtt');
});

function sendCommand(gateway_id, contents) {
    var topic = "/" + gateway_id;
    var message = []
    var msgc = 0;
    message[msgc++] = '{';
    message[msgc++] = '[';
    for(var i=0; i<contents.length; i++) {
        if (contents[i] == ' ' && message[msgc - 1] == ' ')
        {
            msgc--;
        }
        if (msgc > 56 && contents[i] === ' ')
        {
            message[msgc++] = ']';
            var payload = message.join("");
            client.publish(topic, payload);
            sl.usleep(100000);
            msgc = 0, message = [], message[msgc++] = '[';
            continue;
        }
        message[msgc++] = contents[i];
    }
    message[msgc++] = ']';
    message[msgc++] = '}';
    sl.usleep(100000);
    var payload = message.join("");
    client.publish(topic, payload);
}

function splice(_string, _separator)
{
    var topic_array = _string.split("/");
    var command = ((_string[0] == '/')?topic_array[2]:topic_array[1]);
    return command;
}

client.on('message', function (topic, message) {
    // message is Buffer
    // console.log(message.toString());
    // client.end()
    callbacks['*']('*', message);

    try {
        var gateway = splice(topic)
        callbacks[gateway](gateway, message.toString());
    } catch (Exception) {
        console.log(" > Could not retrieve function for topic: ", gateway.toString());
    }
});

callbacks['*'] = function (tops, message) {
    //console.log(" > ", message.toString());
};

function setCallback(_topic, _funct) {
    callbacks[_topic] = _funct;
    console.log(_topic, "is waiting for action.");
    // //callbacks[_topic](_topic, "testing");
    // // {[CU 66 t i u c   # f p m u f s k p m {[sadn jas d ksla sak d]
    // //     {[CU 66 t i u c   # f p m u f s k p m u f w 2D p 2G u 2C s 2G]
    // //         [q 2G q 2G s 2G u 2C u 2C s 2G u 2C u h v f w f t i u f x]
    // //             [f n p n m p 2J n 2J n 2J p 2J q 2G u sH CY 2$ s 22u CV 31]
    // //         [s 22t CV 32 q 22v CU 33 q 22w CU 32 q 22w CU 33 p]}
    //
    // callbacks[_topic](_topic, " {[CU 66 t i u c   # f p m u f s k p m {[sadn jas d ksla sak d] ");
    // callbacks[_topic](_topic, " {[CU 66 t i u c   # f p m u f s k p m u f w 2D p 2G u 2C s 2G] ");
    // callbacks[_topic](_topic, " [q 2G q 2G s 2G u 2C u 2C s 2G u 2C u h v f w f t i u f x] ");
    // callbacks[_topic](_topic, " [f n p n m p 2J n 2J n 2J p 2J q 2G u sH CY 2$ s 22u CV 31] ");
    // callbacks[_topic](_topic, " [s 22t CV 32 q 22v CU 33 q 22w CU 32 q 22w CU 33 p]} ");

}
exports.setCallback = setCallback;
exports.sendCommand = sendCommand;
