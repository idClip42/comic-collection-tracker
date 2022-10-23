"use strict";

const express = require("express");
const path = require("path");
const { LoadWithPersonal } = require("./src/loadWithPersonal");
 
(async () => {
    const volumes = await LoadWithPersonal();

    const app = express()
    app.get('/', function (req, res) {
        res.sendFile(path.join(__dirname, "public", "index.html"));
    });
    app.get('/books', function (req, res) {
        res.send(JSON.stringify(volumes));
    });
    app.get('/*', function (req, res) {
        res.sendFile(path.join(__dirname, "public", req.url));
    });
    app.listen(3000)
})();