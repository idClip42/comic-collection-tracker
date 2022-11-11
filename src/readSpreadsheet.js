"use strict";

const XLSX = require("xlsx");

const CONFIG = require("./../config.json");

module.exports.ReadSpreadsheet = function(){
    /** @type {Object<string, Array<number>>} */
    const ownedBooks = {};
    /** @type {Object<string, Array<number>>} */
    const onlyInOwnedTrades = {};
    for(let key in CONFIG.volumes.tracked){
        ownedBooks[key] = [];
        onlyInOwnedTrades[key] = [];
    }

    const tracker_workbook = XLSX.readFile(CONFIG.trackerWorkbookPath, {
        cellStyles: true
    });
    const sheet_name = tracker_workbook.SheetNames;
    const sheet = tracker_workbook.Sheets[sheet_name[0]];

    // Get all cells in the B column
    const allCells = Object.entries(sheet);
    const cells = allCells.filter(([cell]) => cell.startsWith("B"));
    // Get all colored cells in the B column
    const coloredCells = cells.filter(([cell, value]) => value.s && value.s.bgColor);
    const uncoloredCells = cells.filter(([cell, value]) => value.s && !value.s.bgColor);

    // Collects all owned single issues
    for (const [cell, value] of coloredCells) {
        AddBookToCorrectVolume(
            value.w,
            ownedBooks
        );
    }

    // Collects all owned TPB reprints
    const ALL_LETTERS_REGEX = /\D/g;
    for (const [cell, value] of uncoloredCells) {
        const row = cell.replace(ALL_LETTERS_REGEX, "");
        const otherCols = allCells.filter(
            ([c, v]) => 
            c.replace(ALL_LETTERS_REGEX, "") === row &&
            c.charAt(0) !== "A" && c.charAt(0) !== "B"
        );
        for (const [otherCell, otherValue] of otherCols){
            if(otherValue.s && otherValue.s.bgColor){
                AddBookToCorrectVolume(
                    value.w,
                    onlyInOwnedTrades
                );
                break;
            }
        }
    }

    return {
        singleIssues : ownedBooks,
        onlyInTrades : onlyInOwnedTrades
    };
};

/**
 * 
 * @param {string} bookName 
 * @param {Object<string, Array<number>>} volumeSet 
 */
 const AddBookToCorrectVolume = function(bookName, volumeSet){
    for(let vol in volumeSet){
        let prefix = CONFIG.volumes.tracked[vol].trackerPrefix;
        if(prefix === ""){
            // let num = parseInt(bookName);
            let num = bookName;
            if(!isNaN(num)){
                volumeSet[vol].push(num);
                break;
            }
            continue;
        }
        else if(bookName.startsWith(prefix)){
            // volumeSet[vol].push(parseInt(bookName.replace(prefix, "")));
            volumeSet[vol].push(bookName.replace(prefix, ""));
            break;
        }
    }
}