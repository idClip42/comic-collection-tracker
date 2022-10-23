"use strict";

/**
 * 
 * @param {PersonalInfo} input 
 */
const PersonalInfo = function(input=null){
    if(!input) input = {};

    /** @type {boolean} */
    this.ownSingleIssue = input.ownSingleIssue || false;
    /** @type {boolean} */
    this.ownInTrade = input.ownInTrade || false;
    /** @type {boolean} */
    this.haveRead = input.haveRead || false;
};

/**
 * 
 * @param {Book} input 
 */
const Book = function(input=null){
    if(!input) input = {};

    /** @type {string} */
    this.volumeName = input.volumeName || "";
    /** @type {number} */
    this.issue = input.issue || 0;
    /** @type {string} */
    this.issueString = input.issueString || "";
    /** @type {string[]} */
    this.writers = input.writers || [];
    /** @type {string[]} */
    this.artists = input.artists || [];
    /** @type {string} */
    this.story = input.story || "";
    /** @type {string} */
    this.cover = input.cover || "";
    /** @type {Date} */
    this.releaseDate = new Date(input.releaseDate) || new Date();
    /** @type {Date} */
    this.coverDate = new Date(input.coverDate) || new Date();
    /** @type {string} */
    this.url = input.url || "";
    this.personal = new PersonalInfo(input.personal);
};

/**
 * 
 * @param {Book} input 
 */
const Volume = function(input){
    if(!input) input = {};
    
    /** @type {string} */
    this.name = input.name || "";
    /** @type {string} */
    this.url = input.url || "";
    /** @type {Book[]} */
    this.issues = [];
    
    if(input.issues)
        for(const item of input.issues)
            this.issues.push(new Book(item));
};

exports.PersonalInfo = PersonalInfo;
exports.Book = Book;
exports.Volume = Volume;