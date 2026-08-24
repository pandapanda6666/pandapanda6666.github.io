const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const html = fs.readFileSync('Edit/Video/Add subtitles/index.html', 'utf8');
const virtualConsole = new jsdom.VirtualConsole();
virtualConsole.on("error", (err) => { console.log("ERROR:", err); });
virtualConsole.on("warn", (warn) => { console.log("WARN:", warn); });
virtualConsole.on("log", (log) => { console.log("LOG:", log); });
virtualConsole.on("jsdomError", (e) => { console.log("JSDOM ERROR:", e); });

const dom = new JSDOM(html, { runScripts: "dangerously", virtualConsole });
console.log("JSDOM started");