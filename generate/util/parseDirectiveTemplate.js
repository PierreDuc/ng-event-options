const fs = require('fs');
const directiveTemplate = require('../const/directiveTemplate');
const supportedEvents = require('../const/supportedEvents');
const sourceDir = require('../const/sourceDir');

function parseDirectiveTemplate(eventName) {
    const filename = `./events/eo-${eventName}.directive`;
    const ucEventName = eventName.charAt(0).toUpperCase() + eventName.slice(1);
    const className = `Eo${ucEventName}Directive`;
    const template = directiveTemplate
        .replace(/{{eventName}}/g, eventName)
        .replace(/{{EventName}}/g, ucEventName)
        .replace(/{{EventType}}/g, supportedEvents[eventName]);

    fs.writeFileSync(`${sourceDir}directive/${filename}.ts`, template);
    return [className, filename];

}

module.exports = parseDirectiveTemplate;
