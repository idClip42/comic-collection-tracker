const { ReadSpreadsheet } = require("./readSpreadsheet");
const rawSavedComicData = require("./../savedComicData.json")
const { Volume } = require("./bookClassStructure");
const CONFIG = require("./../config.json");

const CONVERSIONS = {
    "1/2"         : "½",
    "1998 (28)" : "1998",
    "1999 (29)" : "1999",
    "2000 (30)" : "2000",
    "2001 (31)" : "2001"
};

exports.LoadWithPersonal = async function(){
    const volumes = [];
    for(const volConfig of rawSavedComicData)
        volumes.push(new Volume(volConfig));

    const personalData = ReadSpreadsheet();

    for(const volume of volumes){
        const singles = personalData.singleIssues[volume.name];
        const trades = personalData.onlyInTrades[volume.name];

        for(const key in CONVERSIONS){
            const singlesIndex = singles.indexOf(key);
            const tradesIndex = trades.indexOf(key);
            if(singlesIndex >= 0)
                singles[singlesIndex] = CONVERSIONS[key];
            if(tradesIndex >= 0)
                trades[tradesIndex] = CONVERSIONS[key];
        }

        for(const ish of volume.issues){
            const singlesIndex = singles.indexOf(ish.issueString);
            const tradesIndex = trades.indexOf(ish.issueString);
            
            if(singlesIndex >= 0){
                ish.personal.ownSingleIssue = true;
                singles[singlesIndex] = undefined;
            }
            if(tradesIndex >= 0){
                ish.personal.ownInTrade = true;
                trades[tradesIndex] = undefined;
            }
            ish.personal.haveRead = true;
        }

        for(const item of singles){
            if(item){
                console.error(`Unmatched Issue from Spreadsheet: ${volume.name} #${item}`);
            }
        }
    }

    return volumes;
};