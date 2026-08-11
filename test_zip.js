const JSZip = require('jszip');
const fs = require('fs');

async function test() {
    const zip = new JSZip();
    zip.file("project.json", "{}");
    const folder = zip.folder("panda_project");
    folder.file("panda.json", "{}");
    
    const buffer = await zip.generateAsync({type: "nodebuffer"});
    
    const readZip = await JSZip.loadAsync(buffer);
    console.log(Object.keys(readZip.files));
}
test();
