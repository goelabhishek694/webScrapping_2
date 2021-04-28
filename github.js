let url = "https://github.com/topics";
let cheerio = require("cheerio");
const PDFDocument = require('pdfkit');
let request = require("request");
let fs = require("fs");
let path = require("path");

request(url, cb);
function cb(error, response, body) {
    if (error) {
        console.log(error);
    }
    else {
        extractHTML(body);
    }
}

function extractHTML(html) {
    let selectorTool = cheerio.load(html);
    let allTopicLinks = selectorTool(".no-underline.d-flex.flex-column.flex-justify-center");
    for (let i = 0; i < allTopicLinks.length; i++) {
        // let topicName=selectorTool(allTopicLinks[i]).find(".f3.lh-condensed.text-center.Link--primary.mb-0.mt-1").text();
        // console.log(topicName);
        let topicLink = selectorTool(allTopicLinks[i]).attr("href");
        let fullTopicLink = "https://github.com" + topicLink;
        // console.log(fullRepoLink);
        gettop8Repos(fullTopicLink);

    }
    
}

function gettop8Repos(fullTopicLink) {
    request(fullTopicLink, cb);
    function cb(error, response, body) {
        if (error) {
            console.log(error);
        }
        else {
            extractAllRepos(body);
        }
    }
}

function extractAllRepos(html) {
    let selectorTool = cheerio.load(html);
    let repoLink = selectorTool(".f3.color-text-secondary.text-normal.lh-condensed .text-bold");
    let topicName = selectorTool(".h1-mktg").text().trim();
    createDir(topicName);  // creates folder with name like AWS Bitcoin JSON etc. 
    // console.log("topicName "+topicName);
    for (let i = 0; i < 8; i++) {

        let fullRepoLink = "https://github.com" + selectorTool(repoLink[i]).attr("href");
        let repoName = fullRepoLink.split("/").pop().trim(); // gets basename of the repo 
        // console.log(fullRepoLink);
        let repoIssueLink = fullRepoLink + "/issues";
        getIssues(topicName, repoName, repoIssueLink);
    }
    // console.log("**************************************************");
}

function getIssues(topicName, repoName, repoIssueLink) {
    request(repoIssueLink, cb);
    function cb(error, response, body) {
        if (error) {
            console.log(error);
        }
        else {
            extractIssues(topicName, repoName, body);
        }
    }
}

function extractIssues(topicName, repoName, html) {
    let selectorTool = cheerio.load(html);
    let issuesArr = selectorTool(".flex-auto.min-width-0.p-2.pr-3.pr-md-2>a");
    let arr = [];
    let repoNamePath = path.join(__dirname, topicName, repoName + ".pdf");
    let doc = new PDFDocument;
    doc.pipe(fs.createWriteStream(repoNamePath));
    doc.font('Helvetica-Bold');
    for (let i = 0; i < issuesArr.length; i++) {
        let name = selectorTool(issuesArr[i]).text();
        let link = "https://github.com/" + selectorTool(issuesArr[i]).attr("href");
        // console.log(name+" -> "+link);
        // arr.push({
        //     "Name": name,
        //     "Link": link
        // })
        //doc.text(JSON.stringify(arr));
        doc.fillColor('green').text("Name : "+name);
        doc.fillColor('blue').text("Link : "+link,{link:link}); // link:link portion changes the link string to clickable link
    }
    // console.table(arr);
    doc.end();
}

function createDir(topicName) {
    let topicNamePath = path.join(__dirname, topicName);
    if (!fs.existsSync(topicNamePath)) {
        fs.mkdirSync(topicNamePath);
    }
}


