const cheerio = require('cheerio');
const fs = require('fs');
const showdown = require('showdown');
let converter = new showdown.Converter()

/* Load Config Files */
const home_page_data = require('./content/home-page.json');

gen_home('Home.html')
gen_home('index.html')



/* Generate Home or Index Page */
function gen_home(html_file)
{
    /* Generate Content for Home Page */
    fs.readFile(`public/${html_file}`, 'utf8', function(err, data) {
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

        /* Modify Featured Photos */
        $("div.u-effect-fade:nth-child(1) > div:nth-child(1) > img:nth-child(1)").attr('data-src', "." + home_page_data['left-image'].replace('/public', ''));
        $("div.u-effect-fade:nth-child(1) > div:nth-child(1) > img:nth-child(1)").attr('src', "." + home_page_data['left-image'].replace('/public', ''));

        $("div.u-effect-fade:nth-child(2) > div:nth-child(1) > img:nth-child(1)").attr('data-src', "." + home_page_data['middle-image'].replace('/public', ''));
        $("div.u-effect-fade:nth-child(2) > div:nth-child(1) > img:nth-child(1)").attr('src', "." + home_page_data['middle-image'].replace('/public', ''));

        $("div.u-effect-fade:nth-child(3) > div:nth-child(1) > img:nth-child(1)").attr('data-src', "." + home_page_data['right-image'].replace('/public', ''));
        $("div.u-effect-fade:nth-child(3) > div:nth-child(1) > img:nth-child(1)").attr('src', "." + home_page_data['right-image'].replace('/public', ''));

        /* Modify Learn to DJ Section Long Text */
        let learn_html = converter.makeHtml(home_page_data['learn-to-dj']); // Create HTML from Markdown
        learn_html = learn_html.replace('<p>', ''); // Remove Paragraph Tags
        learn_html = learn_html.replace('</p>', '');
        $('div.u-align-left:nth-child(5) > div:nth-child(1) > p:nth-child(2)').html(learn_html);

        /* Modify Members Section Long Text */
        let members_text = converter.makeHtml(home_page_data['members-section-text']); // Create HTML from Markdown
        members_text = members_text.replace('<p>', ''); // Remove Paragraph Tags
        members_text = members_text.replace('</p>', '');
        $('div.u-align-left:nth-child(2) > div:nth-child(1) > p:nth-child(2)').html(members_text);

        /* Modify Social Links */
        $('a.u-active-none:nth-child(1)').html(home_page_data['social-1'])
        $('a.u-active-none:nth-child(1)').attr('href', home_page_data['social-link-1'])
        $('a.u-active-none:nth-child(2)').html(home_page_data['social-2'])
        $('a.u-active-none:nth-child(2)').attr('href', home_page_data['social-link-2'])
        $('a.u-active-none:nth-child(3)').html(home_page_data['social-3'])
        $('a.u-active-none:nth-child(3)').attr('href', home_page_data['social-link-3'])

        /* 
            End Page Modifications
        */


        /* Write out Modified HTML */
        fs.writeFile(`public/${html_file}`, $.html(), function(err) {
            /* Throw Error to Avoid Malformed Content */
            if (err) throw err;
            
            /* Log Success Message */
            console.log(`Data replaced for ${html_file}`);
        });
    });
}