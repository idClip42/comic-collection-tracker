"use strict";

/** @typedef {import("./../src/bookClassStructure").Book} Book */
/** @typedef {import("./../src/bookClassStructure").Volume} Volume */

const CONFIG = {
    "YEARS": {
        "NEW_LINES": false,
        "BOOKMARKS": false,
        "EXCLUDED_VOLUMES": [
            "Annual"
        ]
    },
    "ISSUES": {
        "NEW_LINES": false,
        "BOOKMARKS": false,
        "INCREMENT": 10,
        "INCLUDE_YEAR": true,
        "EXCLUDED_VOLUMES": [
            "Annual"
        ]
    },
    "REPRINTS": {
        "SHOW_REPRINTS": true
    }
};

const StatsObj = function(){
    this.Owned = {
        "Floppy": 0,
        "Trade": 0
    };
    this.Unowned = 0;
    this.Total = 0;
}

const STATS = new StatsObj();
const STATS_ONLY_MAIN = new StatsObj();

const MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
];

const modulusValue = 1;

window.onload = function () {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {

            /** @type {Volume[]} */
            const volumes = JSON.parse(xhttp.responseText);
            /** @type {Book[]} */
            let books = [];
            let volumeToIsMain = {};
            for (const vol of volumes){
                books = books.concat(vol.issues);
                volumeToIsMain[vol.name] = vol.mainSeries;
            }

            books.sort((a, b) => {
                return (new Date(a.coverDate)) - (new Date(b.coverDate))
            });

            if (CONFIG.ISSUES.BOOKMARKS) {
                AddIssueBookmark(books[0]);
            }

            let startYear = new Date(books[0].coverDate).getFullYear();

            if (CONFIG.YEARS.BOOKMARKS) {
                AddYearBookmark(startYear);
            }

            let prevYear = startYear - (startYear % modulusValue);
            for (const book of books) {


                // If this is an issue divisible by the increment
                if (book.issue % CONFIG.ISSUES.INCREMENT === 0 &&
                    // And if it's not in an excluded volume
                    !CONFIG.ISSUES.EXCLUDED_VOLUMES.includes(book.volumeName)) {

                    if (CONFIG.ISSUES.NEW_LINES)
                        AddNewLine();

                    if (CONFIG.ISSUES.BOOKMARKS)
                        AddIssueBookmark(book);
                }

                // let bookYear = book.coverYear;
                let bookYear = new Date(book.coverDate).getFullYear();
                let newYear = bookYear - (bookYear % modulusValue);
                if (newYear > prevYear) {

                    if (CONFIG.YEARS.NEW_LINES)
                        AddNewLine();

                    if (CONFIG.YEARS.BOOKMARKS)
                        AddYearBookmark(newYear);

                    prevYear = newYear;
                }

                AddBook(
                    book,
                    volumeToIsMain[book.volumeName]
                );
            }

            console.log(STATS);
            console.log(STATS_ONLY_MAIN);

            AddStatsSpan(
                "Single Issues",
                STATS.Owned.Floppy,
                (STATS.Owned.Floppy / STATS.Total * 100).toFixed(2),

                STATS_ONLY_MAIN.Owned.Floppy,
                (STATS_ONLY_MAIN.Owned.Floppy / STATS_ONLY_MAIN.Total * 100).toFixed(2)
            );
            AddStatsSpan(
                "In TPB",
                STATS.Owned.Trade,
                (STATS.Owned.Trade / STATS.Total * 100).toFixed(2),

                STATS_ONLY_MAIN.Owned.Trade,
                (STATS_ONLY_MAIN.Owned.Trade / STATS_ONLY_MAIN.Total * 100).toFixed(2)
            );
            AddStatsSpan(
                "Total Owned Issues",
                STATS.Owned.Floppy + STATS.Owned.Trade,
                ((STATS.Owned.Floppy + STATS.Owned.Trade) / STATS.Total * 100).toFixed(2),

                STATS_ONLY_MAIN.Owned.Floppy + STATS_ONLY_MAIN.Owned.Trade,
                ((STATS_ONLY_MAIN.Owned.Floppy + STATS_ONLY_MAIN.Owned.Trade) / STATS_ONLY_MAIN.Total * 100).toFixed(2)
            );
            AddStatsSpan(
                "Unowned Issues",
                STATS.Unowned,
                ((STATS.Unowned) / STATS.Total * 100).toFixed(2),

                STATS_ONLY_MAIN.Unowned,
                ((STATS_ONLY_MAIN.Unowned) / STATS_ONLY_MAIN.Total * 100).toFixed(2)
            );
            AddStatsSpan(
                "Total Issues",
                STATS.Total,
                null,

                STATS.Total,
                null
            );
        }
    };
    xhttp.open("GET", "books", true);
    xhttp.send();
};

const EXT_OPTIONS = [
    ".jpg",
    ".png"
];

/**
 * 
 * @param {Book} book 
 * @param {boolean} isMain 
 */
const AddBook = function (book, isMain) {
    let list = document.getElementById("books");
    let li = document.createElement("li");
    list.appendChild(li);

    let img = document.createElement("img");

    for (let ext of EXT_OPTIONS) {
        if (book.cover.includes(ext)) {
            img.src = book.cover.split(ext)[0] + ext;
            break;
        }
    }

    li.appendChild(img);

    let description = document.createElement("span");
    description.className = "description";
    const coverDate = (new Date(book.coverDate));
    description.innerHTML = `${book.volumeName} #${book.issueString}<br><br>"${book.story}"<br><br>${MONTHS[coverDate.getMonth()]} ${coverDate.getFullYear()}`;
    if (book.releaseDate)
        description.innerHTML += `<br><br>(${new Date(book.releaseDate).toLocaleDateString()})`;
    li.appendChild(description);

    if (!book.personal.ownSingleIssue) {
        img.className += " unowned";
        description.className += " unowned";
        if (!book.personal.ownInTrade) {
            STATS.Unowned++;
            if(isMain)
                STATS_ONLY_MAIN.Unowned++;
        }
    }
    if (CONFIG.REPRINTS.SHOW_REPRINTS) {
        if (book.personal.ownInTrade) {
            let img2 = document.createElement("img");
            img2.src = img.src;
            img.after(img2);
            img2.className += " only-reprint";
            STATS.Owned.Trade++;
            if(isMain)
                STATS_ONLY_MAIN.Owned.Trade++;
        }
    }

    if (book.personal.ownSingleIssue && !book.personal.ownInTrade) {
        STATS.Owned.Floppy++;
        if(isMain)
            STATS_ONLY_MAIN.Owned.Floppy++;
    }

    let credits = [...book.writers, ...book.artists];
    if (credits.length > 0) {
        credits = [...new Set(credits)];
        description.innerHTML += `<br><br>${credits.join(", ")}`;

    }

    STATS.Total++;
    if(isMain)
        STATS_ONLY_MAIN.Total++;
};

/**
 * 
 * @param {number} year 
 */
const AddYearBookmark = function (year) {
    AddBookmark(year);
}

/**
 * 
 * @param {Book} book 
 */
const AddIssueBookmark = function (book) {
    let text = `${book.volumeName}  #${book.issueString}`;
    if (CONFIG.ISSUES.INCLUDE_YEAR)
        text += ` (${(new Date(book.coverDate)).getFullYear()})`;
    AddBookmark(text);
}

/**
 * 
 * @param {string} text 
 */
const AddBookmark = function (text) {
    let list = document.getElementById("books");
    let li = document.createElement("li");
    list.appendChild(li);
    li.className = "label-bookmark";
    li.innerHTML = text;
};

const AddNewLine = function () {
    let list = document.getElementById("books");
    let br = document.createElement("br");
    list.appendChild(br);
}

const AddStatsSpan = function(label, rawNum, percentage, rawNumMain, percentageMain){
    const parent = document.getElementById("stats");
    const rootDiv = document.createElement("tr");
    parent.appendChild(rootDiv);

    const items = [
        "Main Series",
        label + ":",
        rawNumMain,
        percentageMain ? 
            "(" + percentageMain + "%)" :
            null,
        "..........",
        "All Series",
        label + ":",
        rawNum,
        percentage ? 
            "(" + percentage + "%)" :
            null,
    ];
    console.log(items.join(" "));

    for(const item of items){
        // if(!item) continue;
        const span = document.createElement("td");
        rootDiv.appendChild(span);
        span.innerHTML = item || "";
    }
}