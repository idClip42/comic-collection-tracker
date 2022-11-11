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

        if(!singles && !trades) continue;

        for(const key in CONVERSIONS){
            const singlesIndex = singles ? singles.indexOf(key) : -1;
            const tradesIndex = trades ? trades.indexOf(key) : -1;
            if(singlesIndex >= 0)
                singles[singlesIndex] = CONVERSIONS[key];
            if(tradesIndex >= 0)
                trades[tradesIndex] = CONVERSIONS[key];
        }

        for(const ish of volume.issues){
            const singlesIndex = singles ? singles.indexOf(ish.issueString) : -1;
            const tradesIndex = trades ? trades.indexOf(ish.issueString) : -1;
            
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

        if(singles){
            for(const item of singles){
                if(item){
                    console.error(`Unmatched Issue from Spreadsheet: ${volume.name} #${item}`);
                }
            }
        }
    }

    return volumes;
};