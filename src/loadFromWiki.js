"use strict";

const fetch = require('isomorphic-fetch');
const { JSDOM } = require("jsdom");

const CONFIG = require("./../config.json");
const { Book, Volume } = require("./bookClassStructure");

const CONSOLE_LOG_EACH_BOOK_SIMPLE = true;
const CONSOLE_LOG_EACH_BOOK_DETAIL = false;

/**
 * 
 * @param {string} name 
 * @param {string} url 
 * @param {boolean} loadSubPageInfo 
 * @returns 
 */
exports.LoadFromWiki = async function(name, url, loadSubPageInfo){
    const volume = new Volume();
    volume.name = name;
    volume.url = url

    const response = await fetch(volume.url);
    const text = await response.text();
    const dom = new JSDOM(text);

    const galleryItems = dom.window.document.getElementsByClassName(
        CONFIG.DOM.GALLERY_ITEM_CLASS
    );
    for(const galleryElement of galleryItems){
        const issue = new Book();

        let spans = galleryElement.getElementsByTagName("span");
        let links = galleryElement.getElementsByTagName("a");
        let images = galleryElement.getElementsByTagName("img");

        issue.volumeName = volume.name;

        const issueLink = links[1];
        issue.url = volume.url.split("/wiki/")[0] + issueLink.href;

        issue.issueString = issueLink.innerHTML.split("#")[1].trim();
        issue.issue = parseInt(issue.issueString) ||  -1;
        
        issue.story = spans[3].innerHTML.replace(/\"/g,"");
        issue.cover = images[0].src;

        issue.releaseDate = links.length > 4 ? new Date(links[2].innerHTML) : null;
        
        const coverMonth = links.length > 4 ? links[3].innerHTML : links[2].innerHTML;
        const coverYear = parseInt(links.length > 4 ? links[4].innerHTML : links[3].innerHTML);
        issue.coverDate = new Date(
            coverYear,
            CONFIG.months.indexOf(coverMonth),
            1, 0, 0, 0, 0
        );

        if(loadSubPageInfo){
            const subResponse = await fetch(issue.url);
            const subText = await subResponse.text();
            const subDom = new JSDOM(subText);

            let h3s = subDom.window.document.getElementsByTagName("h3");
            for(let h of h3s){
                if(h.innerHTML === "Writer(s)"){
                    let names = h.parentElement.getElementsByTagName("a");
                    for(let n of names){
                        issue.writers.push(n.innerHTML);
                    }
                }
                if(h.innerHTML === "Penciler(s)"){
                    let names = h.parentElement.getElementsByTagName("a");
                    for(let n of names){
                        issue.artists.push(n.innerHTML);
                    }
                }
            }
        }

        volume.issues.push(issue);

        if(CONSOLE_LOG_EACH_BOOK_SIMPLE){
            console.log(` - Finished #${issue.issueString} / ${galleryItems.length}`);
        }

        if(CONSOLE_LOG_EACH_BOOK_DETAIL){
            console.log(issue);
        }
    }

    return volume;
};