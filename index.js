/**
 * Karma reporter for brackets
 * 
 * @author Alessandro Artoni <artoale@gmail.com>
 * 
 * The MIT Licence
 * Copyright (C) 2013 Alessandro Artoni <artoale@gmail.com>
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is furnished
 * to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
 * PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
 * CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE
 * OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 **/


/*jslint vars: true, devel: true, nomen: true, indent: 4, maxerr: 50, node: true */

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
        browsers.forEach(function (browser) {
            toEmit.push(browser);
        });
        socket.emit('runStart', toEmit);
    };

    this.onBrowserError = function (browser, error) {
        socket.emit('browserError', {
            browser: browser,
            error: formatError(error)
        });
    };

    this.onSpecComplete = function (browser, result) {
        socket.emit('specComplete', {
            browser: browser,
            result: result
        });
    };

    this.onBrowserComplete = function (browser) {
        socket.emit('browserComplete', {
            browser: browser
        });

    };

    this.onRunComplete = function (browsers, results) {
        socket.emit('runComplete', {
            browsers: browsers,
            results: results
        });

    };
    this.adapters = [];


};
//Explicitily configure and export di module
BracketsReporter.$inject = ['config', 'formatError'];

module.exports = {
    'reporter:brackets': ['type', BracketsReporter]
};