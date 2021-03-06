/**
 * Karma reporter for brackets
 * 
 * @author Alessandro Artoni <artoale@gmail.com> https://github.com/artoale
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

var sio = require('socket.io');


var BracketsReporter = function (config, formatError, logger) {
    'use strict';
    var console = logger.create('Brackets reporter');
    var port = config.brackets && config.brackets.port || 5000;
    var io = sio(port);

    io.on('error', function () {
        console.warn('Unable to start server at http://localhost:' + port);
    });

    io.on('connection', function (socket) {
            console.info('Client connected to brackets reporter');
            socket.on('runStart', function (brws) {
                _domainManager.emitEvent("karmaServer", "runStart", [brws]);
            });
            socket.on('runComplete', function (data) {
                _domainManager.emitEvent("karmaServer", "runComplete", [data]);
            });
            socket.on('browserError', function (data) {
                _domainManager.emitEvent("karmaServer", "browserError", [data]);
            });
            socket.on('specComplete', function (data) {
                _domainManager.emitEvent("karmaServer", "specComplete", [data]);
            });

    });

    this.onRunStart = function (browsers) {
        var toEmit = [];
        browsers.forEach(function (browser) {
            toEmit.push(browser);
        });
        io.emit('runStart', toEmit);
    };

    this.onBrowserError = function (browser, error) {
        io.emit('browserError', {
            browser: browser,
            error: formatError(error)
        });
    };

    this.onSpecComplete = function (browser, result) {
        io.emit('specComplete', {
            browser: browser,
            result: result
        });
    };

    this.onBrowserComplete = function (browser) {
        io.emit('browserComplete', {
            browser: browser
        });

    };

    this.onRunComplete = function (browsers, results) {
        io.emit('runComplete', {
            browsers: browsers,
            results: results
        });

    };
    this.adapters = [];


};
//Explicitily configure and export di module
BracketsReporter.$inject = ['config', 'formatError', 'logger'];

module.exports = {
    'reporter:brackets': ['type', BracketsReporter]
};