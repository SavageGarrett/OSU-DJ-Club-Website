const cheerio = require('cheerio');
const fs = require('fs');
const showdown = require('showdown');
let converter = new showdown.Converter()

/* Load Config Files */
const home_page_data = require('./content/home-page.json');

console.log(home_page_data)



/* Generate Content for Home Page */
fs.readFile('public/Home.html', 'utf8', function(err, data) {
    /* Throw Error to Avoid Malformed Content */
    if (err) throw err;

    /* Load HTML data */
    let $ = cheerio.load(data);

    /* 
        Page Modifications
    */

    /* Modify Tab Title */
    $('title').html(home_page_data['tab-title']);

    /* Modify Page Heading */
    $('h1.u-text-body-alt-color').html(home_page_data.title);

    /* Modify Subtitle */
    $('h5.u-text:nth-child(2)').html(home_page_data.subtitle);

    /* Modify President's Name */
    $('h4.u-text:nth-child(3)').html(home_page_data['pres-name']);

    /* Modify President's E-Mail */
    $('a.u-active-none:nth-child(4)').html(home_page_data['pres-email']);
    $('a.u-active-none:nth-child(4)').attr("href", `mailto:${home_page_data['pres-email']}`);

    /* Modify VP's Name */
    $('h4.u-custom-font').html(home_page_data['vp-name']);

    /* Modify VP's E-Mail */
    $('a.u-active-none:nth-child(6)').html(home_page_data['vp-email']);
    $('a.u-active-none:nth-child(6)').attr("href", `mailto:${home_page_data['vp-email']}`);

    /* Modify About Section */
    let about_html_text = converter.makeHtml(home_page_data.about); // Create HTML from Markdown
    about_html_text = about_html_text.replace('<p>', ''); // Remove Paragraph Tags
    about_html_text = about_html_text.replace('</p>', '');
    $('div.u-align-left:nth-child(3) > div:nth-child(1) > p:nth-child(2)').html(about_html_text);

    /* 
        End Page Modifications
    */


    /* Write out Modified HTML */
    fs.writeFile('public/Home.html', $.html(), function(err) {
        /* Throw Error to Avoid Malformed Content */
        if (err) throw err;
        
        /* Log Success Message */
        console.log('Data replaced for Home page.\n');
    });
});