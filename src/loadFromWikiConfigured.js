const { LoadFromWiki } = require("./loadFromWiki");
const CONFIG = require("./../config.json");

exports.LoadFromWikiConfigured = async function(){
    const volumes = [];
    for(let key in CONFIG.volumes){
        console.log(`Loading "${key}"...`);
        const volume = await LoadFromWiki(
            key,
            CONFIG.volumes[key].url,
            CONFIG.loadSubPageInfo
        );

        console.log(`Finished "${key}".`);
        volumes.push(volume);
    }
    return volumes;
};