"use strict";

var MongoClient = require('mongodb').MongoClient;

var db = null;

function Connect(mongo_url, cb) {
    let options = {
        autoReconnect: true,
        poolSize: 25,
        connectTimeoutMS: 30000,
        socketTimeoutMS: 300000,
        useNewUrlParser: true
    };
    MongoClient.connect(mongo_url, options, function (err, database) {
        // use global variable, this entire module is for db access!!
        db = database.db('dungeons-and-waifus');
        database.on('close', () => {
            console.log("MongoDB closed, nulling it in Db!!");
        });
        console.log("Conectado")
        cb();
    });
}

function Collection(collect, cb) {
    if (!collect || typeof collect !== "string") {
        return cb("Invalid collection", null);
    }
    try {
        var collection = db.collection(collect);
    } catch (e) {
        console.log("Can not access collection in DB: " + e);
        return cb(e, null);
    }
    return cb(null, collection);
}

// Insert('users',{obj_user},null,function(err,data){
// })

function Insert(collect, object, options, cb) {
    if (!Array.isArray(object)) {
        object = [object];
    }
    Collection(collect, (err, collection) => {
        if (err) { return cb(err); }
        collection.insertMany(object, options || {}, cb);
    });
}

// Update('chars', { id: 123, userid: 'admin' }, { $set: { hp: 123 } }, true, function (err, data) {
// });
function Update(collect, selector, update, one, cb) {
    Collection(collect, (err, collection) => {
        if (err) { return cb(err); }
        update = update || {};
        let action = one ? "updateOne" : "updateMany";
        collection[action](selector, update, (err, result) => {
            if (err) {
                console.log("Error in update:", err);
                console.log("Query was: ", selector, update);
            }
            return cb(err, result);
        });
    });
}

function Remove(collect, selector, options, one, cb) {
    Collection(collect, (err, collection) => {
        if (err) { return cb(err); }
        options = options || {};
        let action = one ? "deleteOne" : "deleteMany";
        collection[action](selector, options, (err, result) => {
            if (err) {
                console.log("Error in remove:", err);
                console.log("Query was: ", selector, options);
            }
            return cb(err, result);
        });
    });
}

// Find('users', { user: 'asd', pass: 'asd' }, { _id: 1 }, null, true, function (err, data) {
//  data = user || undefined
// })

// lte = 'less than or equals'
// lt = 'less than'
// gt = 'greater than'
// {posX:{$lte:3,$gte:0}};
function Find(collect, selector, projection, sort, limit, cb) {
    Collection(collect, (err, collection) => {
        if (err) { return cb(err); }
        // let indexHint = CheckCorrectIndex(collect, selector, sort || null);
        projection = projection || {};
        let findIt;
        if (sort && Object.keys(sort).length) {
            findIt = collection.find(selector, projection).sort(sort);
            // findIt = collection.find(selector, projection).sort(sort).hint(indexHint);
        } else {
            findIt = collection.find(selector, projection);
            // findIt = collection.find(selector, projection).hint({type:1});
        }
        if (limit) {
            findIt.limit((limit == true) ? 1 : limit);
        }
        findIt.toArray((err, res) => {
            if (limit == true && res) {
                res = res[0];
            }
            return cb(err, res ? res : null);
        });
    });
}

module.exports = {
    Connect: Connect,
    Insert: Insert,
    Update: Update,
    Remove: Remove,
    Find: Find,
}