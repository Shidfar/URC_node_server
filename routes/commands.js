/**
 * Created by shidfar on 11/1/16.
 */
var mongoClient = require('../modules/mongoClient');
var mqttClient = require('../modules/mqttClient');
var buffer = [];

function updateCommandsCollection(gateway) {
    var str = buffer[gateway]._content.join("");
    console.log(" > ", gateway, " -> ", str, "[", buffer[gateway]._len, "]");
    mongoClient.addNewCommand(gateway, str);
}

function newCommand (gateway, message) {
    var str = message.split('');
    len = message.length;
    if(buffer[gateway] === undefined) {
        console.log(" > New gateway : ", gateway, " [", len, "]");
        buffer[gateway] = {_exist:true, _content:[], _len:0, _curly:0, _square:false
        };
    }
    if(buffer[gateway]._exist) {
        for(var i=0; i<len; i++) {
            if(str[i] === '{') {
                buffer[gateway]._curly = 1;
                buffer[gateway]._len = 0;
                continue;
            }
            if(str[i] === '[') {
                buffer[gateway]._square = true;
                continue;
            }
            if(str[i] === ']') {
                buffer[gateway]._square = false;
                continue;
            }
            if(str[i] === '}') {
                buffer[gateway]._curly = 2;
                buffer[gateway]._len--;
                updateCommandsCollection(gateway);
                break;
            }
            if(buffer[gateway]._square && buffer[gateway]._curly == 1) {
                if(str[i] === ' ' && buffer[gateway]._content[(buffer[gateway]._len)-1] === ' ')
                    buffer[gateway]._len--;
                buffer[gateway]._content[buffer[gateway]._len++] = str[i];
            }
            // else {
            //     console.log(str[i]);
            //     break;
            // }
        }
        buffer[gateway]._content[buffer[gateway]._len++] = ' ';
    }
}

mqttClient.setCallback("cc3200_01", newCommand);

function deleteCommand(req, res) {
    console.log(req.body.command_id);
    // res.send({"success":true});
    mongoClient.deleteCommand(req, res);
}

function getAll(req, res) {
    response = mongoClient.findAll(req, res);
}

function sendCommand(req, res) {

    var command_id = req.body.command_id;
    console.log(" > ", req.body, "is pressed")
    if(command_id === "" || command_id === undefined) {
        res.send({"success":false, "message":"command_id is a mandatory field"});
        return;
    }

    mongoClient.getButtonContent(command_id, function (contens) {

        mqttClient.sendCommand(contens.gateway_id, contens.contents)

        console.log(" > ", contens.gateway_id, " > ", contens.name);
        res.send({"success":true});
    });
}

exports.deleteCommand = deleteCommand;
exports.sendCommand = sendCommand;
exports.getAll = getAll;