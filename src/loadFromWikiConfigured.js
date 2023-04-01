const { LoadFromWiki } = require("./loadFromWiki");
const CONFIG = require("./../config.json");

exports.LoadFromWikiConfigured = async function(){
    const volumes = [];

    for(let key in CONFIG.volumes.tracked){
        volumes.push(
            await AssembleVolume(
                key,
                CONFIG.volumes.tracked[key].url,
                true
            )
        );
    }

    for(let key in CONFIG.volumes.ongoing){
        const volume = await AssembleVolume(
            key,
            CONFIG.volumes.ongoing[key].url,
            true
        );
        volumes.push(volume);

        for(let issue of volume.issues){
            if(issue.releaseDate < new Date(Date.now())){
                issue.personal.haveRead = true;
                issue.personal.ownSingleIssue = true;
            }
        }
    }

    for(let key in CONFIG.volumes.other.completed){
        const volume = await AssembleVolume(
            CONFIG.volumes.other.completed[key],
            CONFIG.volumes.other.completed[key],
            false
        );
        volumes.push(volume);

        for(let issue of volume.issues){
            issue.personal.haveRead = true;
            issue.personal.ownSingleIssue = true;
        }
    }

    for(let key in CONFIG.volumes.other.incomplete){
        const volume = await AssembleVolume(
            CONFIG.volumes.other.incomplete[key].url,
            CONFIG.volumes.other.incomplete[key].url,
            false
        );
        volumes.push(volume);

        for(let issue of volume.issues){
            if(!CONFIG.volumes.other.incomplete[key].missing.includes(issue.issue)){
                issue.personal.haveRead = true;
                issue.personal.ownSingleIssue = true;
            }
            if(CONFIG.volumes.other.incomplete[key].haveTpb === true){
                issue.personal.haveRead = true;
                issue.personal.ownInTrade = true;
            }
        }
    }

    return volumes;
};

const AssembleVolume = async function(name, url, mainSeries){
    console.log(`Loading "${name}"...`);
    const volume = await LoadFromWiki(
        name,
        url,
        CONFIG.loadSubPageInfo,
        mainSeries
    );
    console.log(`Finished "${name}".`);
    return volume;
}