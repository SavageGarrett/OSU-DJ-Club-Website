const fs = require('fs');

/* 
    Parse Collection to JSON Array
    Sort by lower priority first
*/
function parseCollection(dir_path)
{
    const FILE_NAMES = fs.readdirSync(dir_path);
    let collection_array = [];

    for (let file of FILE_NAMES)
    {
        if (file.includes('.json'))
        {
            let file_contents = fs.readFileSync(`${dir_path}/${file}`, {encoding: 'utf8'});
            let file_contents_json = JSON.parse(file_contents);
            collection_array.push(file_contents_json)
        } 
        
    }

    collection_array.sort(compareLT)

    return collection_array
}

/* 
    Parse Collection to JSON Array
    Sort by highest date first
*/
function parseCollectionDate(dir_path)
{
    const FILE_NAMES = fs.readdirSync(dir_path);
    let collection_array = [];

    for (let file of FILE_NAMES)
    {
        if (file.includes('.json'))
        {
            let file_contents = fs.readFileSync(`${dir_path}/${file}`, {encoding: 'utf8'});
            let file_contents_json = JSON.parse(file_contents);
            collection_array.push(file_contents_json)
        } 
        
    }

    collection_array.sort(compareGTDate)

    return collection_array
}

/* 
    Compare a to b and find which is less
 */
function compareLT(a, b)
{
    let ret = 0;

    if (a.hasOwnProperty('priority') && b.hasOwnProperty('priority'))
    {
        ret = (a.priority < b.priority) ? -1 : 1;
    }
    
    return ret;
}

/* 
    Compare a to b and find highest date
*/
function compareGTDate(a, b)
{
    let ret = 0;

    if (a.hasOwnProperty('event-date') && b.hasOwnProperty('event-date'))
    {
        ret = (new Date(a["event-date"]) > new Date(b["event-date"])) ? -1 : 1;
    }

    return ret;
}

module.exports = {parseCollection, parseCollectionDate};