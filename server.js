'use strict';

var express = require('express'),
    http = require('http'),
    parser = require('body-parser'),
    gameDB = require('./modules/mongoDB'),
    redis = require('./modules/redis'),
    app;

var numberofUsers = 0;

//create our Express powered HTTP server
app = express();

app.use(express.static(__dirname + '/client'));
app.use(parser.json());
app.use(parser.urlencoded({ extended: true }));


gameDB.Question.remove({}, function(err, movies) {
    if (movies) {
        console.log('collection removed');
    }
});

var getRandomInt = function(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

app.post('/question', function(req, res) {
    var q = req.body.question;
    var a = req.body.answer;
    // store the question to the database
    var newQuestion = new gameDB.Question({
        question: q,
        answer: a
    });
    // Store the movie to the mongodb and redis
    newQuestion.save();
    res.json({ 'Result': 'success' });
});

app.post('/answer', function(req, res) {
    var id = req.body.answerId;
    var a = req.body.answer;
    var redisID = req.body.redisID;
    console.log(redisID);
    var isCorrect = false;

    gameDB.Question.findOne({ _id: id }, function(err, result) {
        if (result) {
            if (result.answer == a) {
                isCorrect = true;
            }
            redis.RPUSH(redisID, isCorrect.toString(), function(err, reply) {
                console.log(reply);
                res.json({ 'Correct': isCorrect });
            });
        }
    });

});

app.post('/score', function(req, res) {
    var redisID = req.body.id;
    redis.lrange(redisID, 0, -1, function(err, reply) {
        var correct = 0;
        var incorrect = 0;
        if (reply != null) {
            reply.forEach(function(answer) {
                if (answer == 'true') {
                    correct++;
                } else {
                    incorrect++;
                }
            });

            res.json({
                'Correct': correct,
                'Incorrect': incorrect
            });
        }
    });



});

app.get('/firstQuestion', function(req, res) {

    //create a redis record 
    var redisID = numberofUsers.toString();
    numberofUsers++;

    //Delete old scores in Redis if exis
    redis.del(redisID, function(reply) {
        console.log("Deleted old scores");
    });

    gameDB.Question.find({}).exec(function(err, questions) {
        if (err) {
            res.send('error');
        } else {
            if (questions.length > 0) {
                res.json({
                    'Result': questions[0].question,
                    'id': questions[0]._id,
                    'redisID': redisID
                });
            } else {
                console.log("Empty");
                res.json({ 'Result': 'No Question' });
            }

        }
    });

});

app.get('/question', function(req, res) {
    gameDB.Question.find({}).exec(function(err, questions) {
        if (err) {
            res.send('error');
        } else {

            if (questions.length > 0) {
                var index = getRandomInt(0, questions.length);
                res.json({
                    'Result': questions[index].question,
                    'id': questions[index]._id.toString()
                });
            } else {
                console.log("Empty");
                res.json({ 'Result': 'No Question' });
            }

        }
    });
});


http.createServer(app).listen(3000);
console.log('Server is listening on port 3000');