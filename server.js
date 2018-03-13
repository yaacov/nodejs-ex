//  OpenShift sample Node application
var express = require("express"),
  app = express(),
  morgan = require("morgan"),
  bodyParser = require("body-parser");

Object.assign = require("object-assign");

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// parse requests of content-type - application/json
app.use(bodyParser.json());

app.engine("html", require("ejs").renderFile);
app.use(morgan("combined"));

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
  ip = process.env.IP || process.env.OPENSHIFT_NODEJS_IP || "0.0.0.0",
  mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL,
  mongoURLLabel = "";

if (mongoURL == null && process.env.DATABASE_SERVICE_NAME) {
  var mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase(),
    mongoHost = process.env[mongoServiceName + "_SERVICE_HOST"],
    mongoPort = process.env[mongoServiceName + "_SERVICE_PORT"],
    mongoDatabase = process.env[mongoServiceName + "_DATABASE"],
    mongoPassword = process.env[mongoServiceName + "_PASSWORD"];
  mongoUser = process.env[mongoServiceName + "_USER"];

  if (mongoHost && mongoPort && mongoDatabase) {
    mongoURLLabel = mongoURL = "mongodb://";
    if (mongoUser && mongoPassword) {
      mongoURL += mongoUser + ":" + mongoPassword + "@";
    }
    // Provide UI label that excludes user id and pw
    mongoURLLabel += mongoHost + ":" + mongoPort + "/" + mongoDatabase;
    mongoURL += mongoHost + ":" + mongoPort + "/" + mongoDatabase;
  }
}
var db = null,
  dbDetails = new Object();

var initDb = function(callback) {
  if (mongoURL == null) return;

  var mongodb = require("mongodb");
  if (mongodb == null) return;

  mongodb.connect(mongoURL, function(err, conn) {
    if (err) {
      callback(err);
      return;
    }

    db = conn;
    dbDetails.databaseName = db.databaseName;
    dbDetails.url = mongoURLLabel;
    dbDetails.type = "MongoDB";

    console.log("Connected to MongoDB at: %s", mongoURL);
  });
};

app.use(express.static('public'))

app.all("/", function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

app.get("/", function(req, res) {
  // try to initialize the db on every request if it's not already
  // initialized.
  if (!db) {
    initDb(function(err) {});
  }
  if (db) {
    var col = db.collection("counts");
    // Create a document with request IP and current time of request
    col.insert({ ip: req.ip, date: Date.now() });
    col.count(function(err, count) {
      if (err) {
        console.log("Error running count. Message:\n" + err);
      }
      res.render("index.html", { pageCountMessage: count, dbInfo: dbDetails });
    });
  } else {
    res.render("index.html", { pageCountMessage: null });
  }
});

app.get("/pagecount", function(req, res) {
  // try to initialize the db on every request if it's not already
  // initialized.
  if (!db) {
    initDb(function(err) {});
  }
  if (db) {
    db.collection("counts").count(function(err, count) {
      res.send("{ pageCount: " + count + "}");
    });
  } else {
    res.send("{ pageCount: -1 }");
  }
});

app.get("/api/v1/:collection", function(req, res) {
  // try to initialize the db on every request if it's not already
  // initialized.
  if (!db) {
    initDb(function(err) {});
  }
  if (db) {
    // check for data of last week
    timestamp = Date.now() - 1000 * 60 * 60 * 24 * 7;
    db
      .collection(req.params.collection)
      .find({ timestamp: { $gt: timestamp } })
      .toArray(function(err, results) {
        res.json(results);
      });
  } else {
    res.send("{ error: db closed }");
  }
});

function send_student(db, res, student) {
  let data = {
    student: student,
    academicPoints: 0,
    socialPoints: 0,
    behavioralPoints: 0
  };

  // check for data of last week
  let timestamp = Date.now() - 1000 * 60 * 60 * 24 * 7;
  db
    .collection("event")
    .find({ studentId: student.id, timestamp: { $gt: timestamp } })
    .toArray(function(err, results) {
      results.forEach(function(result) {
        console.log(result);
        console.log(data);
        if (
          result.value &&
          result.type &&
          typeof data[result.type + "Points"] !== "undefined"
        ) {
          data[result.type + "Points"] += parseInt(result.value, 10);
        }
      });

      res.json(data);
    });
}

app.get("/api/v1/student/:id", function(req, res) {
  // try to initialize the db on every request if it's not already
  // initialized.
  if (!db) {
    initDb(function(err) {});
  }
  if (db) {
    console.log(req.params.id);
    db
      .collection("student")
      .find({ id: req.params.id })
      .toArray(function(err, results) {
        student = results[0];

        if (student) {
          send_student(db, res, student);
        } else {
          res.send("{ error: student not found }");
        }
      });
  } else {
    res.send("{ error: db closed }");
  }
});

app.post("/api/v1/:collection", function(req, res) {
  let r;

  // try to initialize the db on every request if it's not already
  // initialized.
  if (!db) {
    initDb(function(err) {});
  }
  if (db) {
    let data = req.body;
    data.timestamp = Date.now();
    db.collection(req.params.collection).save(data, (err, result) => {
      if (err) {
        res.send("{ error: " + err + "}");
      } else {
        res.send("{ result: " + result + "}");
      }
    });
  } else {
    res.send("{ error: db closed }");
  }
});

// error handling
app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send("Something bad happened!");
});

initDb(function(err) {
  console.log("Error connecting to Mongo. Message:\n" + err);
});

app.listen(port, ip);
console.log("Server running on http://%s:%s", ip, port);

module.exports = app;
