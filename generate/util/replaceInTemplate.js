const fs = require('fs');
const sourceDir = require('../const/sourceDir');

function replaceInTemplate(filename, replaceKey, replace) {
    const fileData = fs
        .readFileSync(sourceDir + filename, 'UTF-8')
        .replace(new RegExp(`(//{{BEGIN:${replaceKey}})[\\s\\S]*(//{{END:${replaceKey}}})`, 'gm'), `$1\n${replace}\n$2`);
    fs.writeFileSync(sourceDir + filename, fileData);

}

module.exports = replaceInTemplate;
