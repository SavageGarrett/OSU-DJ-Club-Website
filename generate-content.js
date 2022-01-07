const cheerio = require('cheerio');
const fs = require('fs');

/* Load Config Files */
const home_page_data = require('./content/home-page.json');

console.log(home_page_data)



/* Generate Content for Home Page */
fs.readFile('public/Home.html', 'utf8', function(err, data) {
    /* Throw Error to Avoid Malformed Content */
    if (err) throw err;

    /* Load HTML data */
    var $ = cheerio.load(data);

    // TODO: make modifications here

    /* Modify Tab Title */
    $('title').html(home_page_data['tab-title'])

    /* Modify Page Heading */
    $('h1.u-text-body-alt-color').html(home_page_data.title)


    /* Write out Modified HTML */
    fs.writeFile('public/Home.html', $.html(), function(err) {
        /* Throw Error to Avoid Malformed Content */
        if (err) throw err;
        
        /* Log Success Message */
        console.log('Data replaced for Home page.\n');
    });
});