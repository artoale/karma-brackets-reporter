

var io = require('socket.io-client');


var BracketsReporter = function (config, formatError) {
    'use strict';


    var sock = io.connect('http://localhost:5000');

    sock.on('error', function () {
        console.warn('Unable to connect to http://localhost:5000');
    });

    var socket = {
        emit: function (msg, data) {
            // console.warn('no server found, skipping');
            this.queue.push({
                msg: msg,
                data: data
            });
        },
        queue: []
    };
    sock.on('connect', function () {
        if (socket.queue.length > 0) {
            socket.queue.forEach(function (item) {
                sock.emit(item.msg, item.data);
            });
            socket.queue = [];
        }
        socket = sock;

    });

    this.onRunStart = function (browsers) {
        var toEmit = [];
        browsers.forEach(function(browser) {
            toEmit.push(browser);
        });
        //console.log('toEmit', toEmit);
        socket.emit('runStart', toEmit);
    };
    
    this.onBrowserError = function (browser, error) {
        //console.log('onBrowserError b:', browser);
        socket.emit('browserError', {
            browser: browser,
            error: formatError(error)
        });
    };

    this.onSpecComplete = function (browser, result) {
        //console.log('onSpecComplete');
        socket.emit('specComplete', {
            browser: browser,
            result: result
        });
    };

    this.onBrowserComplete = function (browser) {

        //console.log('onBrowserComplete');
        socket.emit('browserComplete', {
            browser: browser
        });
    
    };

    this.onRunComplete = function (browsers, results) {
        // console.log(results);
        //console.log('onRunComplete');
        socket.emit('runComplete', {
            browsers: browsers,
            results: results
        });

    };
    this.adapters = [];


};
BracketsReporter.$inject = ['config', 'formatError'];
// PUBLISH DI MODULE
module.exports = {
  'reporter:brackets': ['type', BracketsReporter]
};
