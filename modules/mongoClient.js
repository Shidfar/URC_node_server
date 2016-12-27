/**
 * Created by shidfar on 11/2/16.
 */

var mongo = require('mongodb');
var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;

var server = new Server('localhost', 27017, {auto_reconnect: true});
db = new Db('blackboxdb', server);

db.open(function(err, db) {
    if(!err) {
        console.log("Connected to 'blackboxdb' database");
        db.collection('commands', {strict:true}, function(err, collection) {
            if (err) {
                console.log("The 'commands' collection doesn't exist. Creating it with sample data...");
                populateDB();
            }
        });
    }
});

exports.findById = function(req, res) {
    var id = req.params.id;
    console.log('Retrieving command: ' + id);
    db.collection('commands', function(err, collection) {
        // collection.find({'_id':new BSON.ObjectId(id)}).limit(1).next(function(err, item) {
        //     res.send(item);
        // });
        collection.find({_id: mongo.ObjectId(id)}).limit(1).toArray(function(err, items) {
            res.send(items);
        });
    });
};

exports.findAll = function(req, res) {
    db.collection('commands', function(err, collection) {
        console.log(" > Get all buttons request from: ", req.body.gateway_id);
        collection.find({"gateway_id":req.body.gateway_id}).toArray(function(err, items) {
            res.send(items);
        });
    });
};

exports.addCommand = function(req, res) {
    var command = req.body;
    console.log('Adding command: ' + JSON.stringify(command));
    db.collection('commands', function(err, collection) {
        collection.insert(command, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred'});
            } else {
                console.log('Success: ' + JSON.stringify(result[0]));
                res.send(result[0]);
            }
        });
    });
};



exports.deleteCommand = function(req, res) {

    var wish = {'_id':new mongo.ObjectId(req.body.command_id)};

    db.collection('commands', function (err, collection) {
        if(collection) {
            collection.remove(wish, function (err, result) {
                if(err) {
                    console.log(" > Error");
                }
                else {
                    console.log(" > Success");
                }
            });
        }
        else {
            console.log(" > No collection...")
        }
    });
    res.send({success:true});
};

/*--------------------------------------------------------------------------------------------------------------------*/
// Populate database with sample data -- Only used once: the first time the application is started.
// You'd typically not find this code in a real-life app, since the database would already exist.
var populateDB = function() {

    var commands = [
        {
            name: "untitled",
            device: "none",
            gateway_id: "cc3200_1",
            contents: "9038209482304823094809238409238098"
        }
        ];

    db.collection('commands', function(err, collection) {
        collection.insert(commands, {safe:true}, function(err, result) {});
    });

};


function addNewCommand(gateway, cipher) {
    console.log('Adding new Command: ', cipher.toString());
    var not_empty = 0;
    for(var i=0; i<cipher.length; i++) {
        if(cipher[i] != ' ')
            not_empty = 1;
    }
    if(not_empty == 0) {
        console.log(" > empty command ignored")
        return ;
    }
    var command = {
        name: "untitled",
        device: "unknown",
        gateway_id: gateway,
        contents: cipher

    };
    db.collection('commands', function (err, collection) {
        collection.insert(command, {safe:true}, function (err, result) {
            if(err) {
                console.log('An error occurred while adding new command to the command centre');
            }
            else {
                console.log('Success: ' + JSON.stringify(result[0]));
            }
        })
    });
    //
    // console.log('Adding command: ' + JSON.stringify(command));
    // db.collection('commands', function(err, collection) {
    //     collection.insert(command, {safe:true}, function(err, result) {
    //         if (err) {
    //             res.send({'error':'An error has occurred'});
    //         } else {
    //             console.log('Success: ' + JSON.stringify(result[0]));
    //             res.send(result[0]);
    //         }
    //     });
    // });
}
var result = "command_id";
function getButtonContent(command_id, callback){

    db.collection('commands', function(err, collection) {
        collection.find({_id: mongo.ObjectId(command_id)}).limit(1).toArray(function(err, items) {
            callback(items[0]);
        });
    });
}

module.exports.getButtonContent = getButtonContent;
module.exports.addNewCommand = addNewCommand;