﻿var express = require('express');
var app = express();
var port = process.env.port || 1337;
var path = require('path');
var root = path.join(__dirname, 'public');

app.use(express.static(root));

app.get('/say-hello', function (req, res) {
    res.send('Hello World!');
});

var server = app.listen(port, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});