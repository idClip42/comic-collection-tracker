"use strict";

const fs = require("fs");
const { LoadFromWikiConfigured } = require("./src/loadFromWikiConfigured");
const CONFIG = require("./config.json");

LoadFromWikiConfigured().then(result => {
    fs.writeFile(
        `./${CONFIG.savedFileName}`,
        JSON.stringify(
            result, 
            null, 
            4
        ),
        err => {
            if(err)
                console.error(err);
            else
                console.log(`"${CONFIG.savedFileName}" saved successfully`);
        }
    );
});