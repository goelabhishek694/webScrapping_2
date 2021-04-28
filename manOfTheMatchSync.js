let url="https://www.espncricinfo.com/series/ipl-2020-21-1210595/match-results";
let request = require("request");
let cheerio = require("cheerio");

request(url,cb);

function cb(error, response, body){
    if(error) console.log(error);
    else{
        extractHTML(body);
    }
}

let allLinksArr=[];
function extractHTML(html){
    let selectorTool=cheerio.load(html);
    let scoreCards=selectorTool(".col-md-8.col-16");
    for(let i=0;i<scoreCards.length;i++){
        let matchLinks=selectorTool(scoreCards[i]).find(".match-info-link-FIXTURES").attr("href");
        let fullMatchLink="https://www.espncricinfo.com/"+matchLinks;
        allLinksArr.push(fullMatchLink);
    }
    getPlayerName(allLinksArr,0);
}

function getPlayerName(allLinksArr,idx){
    if(idx==allLinksArr.length) return;
    request(allLinksArr[idx],cb);
    function cb(error,response,body){
        if(error) console.log(error);
        else{
            extractPlayer(body);
            getPlayerName(allLinksArr,idx+1);
        }
    }
}

function extractPlayer(html){
    let selectorTool=cheerio.load(html);
    let playerName=selectorTool(".best-player-name a").text();
    let teamName=selectorTool(".best-player-team-name").text();
    console.log(teamName+"-> "+playerName);
}

