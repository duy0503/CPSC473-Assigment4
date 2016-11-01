/* jshint browser: true, jquery: true, camelcase: true, indent: 2, undef: true, quotmark: single, maxlen: 80, trailing: true, curly: true, eqeqeq: true, forin: true, immed: true, latedef: true, newcap: true, nonew: true, unused: true, strict: true */

var currentId;
var redisID = null;
var results = [];
var createQuestion = function() {
    var question = {
        question: "What is your name?",
        answer: "Duy"
    };

    $.post('question', question, function(res) {
        console.log("Create a question");
    });

    question = {
        question: "Who was the first computer programmer?",
        answer: "Ada Lovelace"
    };

    $.post('question', question, function(res) {
        console.log("Create a question");
    });
};

var getFirstQuestion = function() {
    $.get('firstQuestion', function(res) {
        $('#function1 .question').text(res.Result);
        if (res.Result != 'No Question') {
            currentId = res.id;
            redisID = res.redisID;
        }
    });
};

var getScore = function() {
    var req = { 'id': redisID };
    $.post('score', req, function(res) {
        alert(JSON.stringify(res));

    });
};

var main = function() {
    'use strict';
    createQuestion();
    getFirstQuestion();

    var callAPI = function(user) {

        var values, input, args, firstArg, secondArg;

        switch (user) {
            case 1:
                if ($('#function1 input').val() !== '') {

                    // split the values to an array of numbers
                    values = $('#function1 input').val().trim();

                    var req = {
                        'answerId': currentId,
                        'answer': values,
                        'redisID': redisID
                    };

                    $.post('answer', req, function(res) {
                        $('#function1 .result').text('Result: ' + res.Correct);
                        results.push(res.Correct);
                    });

                    $('#function1 input').val('');
                }
                break;
        }

    };

    $('#question-btn').on('click', function(event) {
        $.get('question', function(res) {
            //var response = JSON.parse(res);
            console.log(res.Result);
            $('#function1 .question').text(res.Result);
            currentId = res.id;
        });
    });

    $('#score-btn').on('click', function(event) {
        getScore();
    });


    $('#function1 button').on('click', function(event) {
        callAPI(1);
    });

    $('#function1 input').on('keypress', function(event) {
        if (event.keyCode === 13) {
            callAPI(1);
        }
    });

};

$(document).ready(main);