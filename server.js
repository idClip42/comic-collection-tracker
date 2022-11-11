"use strict";

const express = require("express");
const path = require("path");
const { LoadWithPersonal } = require("./src/loadWithPersonal");

const PORT = 3000;
 
(async () => {
    console.log("Loading Volumes...");
    const volumes = await LoadWithPersonal();
    console.log("Loaded Volumes.");

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
    app.listen(PORT)

    console.log(`Listening on localhost:${PORT}`);
})();