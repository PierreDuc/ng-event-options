const replaceInTemplate = require('./generate/util/replaceInTemplate');
const parseDirectiveTemplate = require('./generate/util/parseDirectiveTemplate');
const supportedEvents = require('./generate/const/supportedEvents');

// Parsing directive template
const eventFiles = Object.keys(supportedEvents).map(parseDirectiveTemplate);

// Getting export import and class name strings
const exportsStr = eventFiles.map(eventFile => `export {${eventFile[0]}} from '${eventFile[1]}';`).join('\n');
const importsStr = eventFiles.map(eventFile => `import {${eventFile[0]}} from '${eventFile[1]}';`).join('\n');
const classNamesStr = eventFiles.map(eventFile => eventFile[0]).join(',\n');


// Replacing template replacement keys with appropriate values
replaceInTemplate('./directive/index.ts', 'Exports', exportsStr);
replaceInTemplate('./directive/eo-directives.ts', 'Imports', importsStr);
replaceInTemplate('./directive/eo-directives.ts', 'ClassNames', classNamesStr);
