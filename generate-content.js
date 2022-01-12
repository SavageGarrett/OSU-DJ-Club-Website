/* Import / Setup Dependencies */
const cheerio = require('cheerio');
const {
    text
} = require('cheerio/lib/api/manipulation');
const fs = require('fs');
const showdown = require('showdown');
let converter = new showdown.Converter();
const parseCollection = require('./collection2array.js')

/* Load Config Files */
const home_page_data = require('./content/home-page.json');


/* gen_home('Home.html');
gen_home('index.html'); */
gen_tags();
/* gen_learn(); */

/**
 * Add google tags script to all .html files in public directory
 */
function gen_tags() {
    let gtags = `
    <!-- Global site tag (gtag.js) - Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-LNT0B8EBGF"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
    
      gtag('config', 'G-LNT0B8EBGF');
    </script>
    `

    /* Gather Public Files */
    let public_files = fs.readdirSync('./public/');

    /* Filter out Non-HTML Documents */
    public_files = public_files.filter(function (word) {
        return word.includes('.html')
    });

    /* Loop over all HTML Files */
    for (let file of public_files) {
        fs.readFile(`public/${file}`, 'utf-8', function (err, data) {
            /* Throw Error to Avoid Malformed Content */
            if (err) throw err;

            /* Load HTML Data */
            let $ = cheerio.load(data);

            /* Declare Head Tag */
            const HEAD = 'head';

            /* Fetch Head HTML */
            let head_html = $(HEAD).html();

            /* Check that Google Tags is Already Included */
            if (!head_html.includes('<!-- Global site tag (gtag.js) - Google Analytics -->')) {
                /* Add Gtags to Head HTML */
                head_html += gtags;

                /* Replace head with updated gtag included */
                $(HEAD).html(head_html);

                /* Write out Modified HTML */
                fs.writeFile(`public/${file}`, $.html(), function (err) {
                    /* Throw Error to Avoid Malformed Content */
                    if (err) throw err;

                    /* Log Success Message */
                    console.log(`Data replaced for ${file}`);
                });
            }
        });
    }
}

/* Generate Learn-to-DJ page */
function gen_learn() {
    fs.readFile('public/Learn-to-DJ.html', 'utf-8', function (err, data) {
        /* Throw Error to Avoid Malformed Content */
        if (err) throw err;

        /* Load HTML data */
        let $ = cheerio.load(data);

        /* Constant Selectors */
        const ENTRY_CONTAINER = 'div.u-expanded-width';

        /* Update Page Content */

        /* Update Repeated Content */

        /* Fetch Learning Entry Data */
        const learning_data = parseCollection('./content/learning');

        /* Loop over Learning Entries */

        let i = 0;
        let insertion_html = '';
        for (let entry of learning_data) {
            /* Insert Repeater Element (3 elements / row) */
            if (i % 3 == 0) insertion_html += `<div class="u-repeater u-repeater-1">`

            /* Insert Entry Element */
            insertion_html += gen_learn_entry(entry["alt-text"], entry["display-image"],
                entry.title, entry.description,
                entry["link-text"], entry.link);

            /* Close Div if End of Line or Last Element */
            if (i % 3 == 2 || i == learning_data.length) insertion_html += `</div>`
            i++
        }

        /* Insert Html into container */
        $(ENTRY_CONTAINER).html(insertion_html)



        /* Write out Modified HTML */
        fs.writeFile('public/Learn-to-DJ1.html', $.html(), function (err) {
            /* Throw Error to Avoid Malformed Content */
            if (err) throw err;

            /* Log Success Message */
            console.log(`Data replaced for Learn-to-DJ.html`);
        });
    });
}

function gen_learn_entry(alt_text, display_image, title, description_md, link_text, link) {
    let description_html = converter.makeHtml(description_md);
    return `
    <div class="u-container-style u-list-item u-repeater-item">
    <div class="u-container-layout u-similar-container u-container-layout-3">
        <img alt="${alt_text}" class="u-expanded-width u-image u-image-default lazyload u-image-3" data-image-width="650" data-image-height="365" data-src="${display_image.replace('/public/','')}">
        <h3 class="u-text u-text-default u-text-palette-2-base u-text-7">${title}</h3>
        <p class="u-text u-text-8">${description_html}</p>
        <a href="${link}" class="u-active-none u-border-2 u-border-hover-palette-2-base u-border-palette-2-light-1 u-btn u-button-style u-hover-none u-none u-text-white u-btn-3">${link_text}</a>
    </div>
    </div>
    `
}

/* Generate Home or Index Page */
function gen_home(html_file) {
    /* Generate Content for Home Page */
    fs.readFile(`public/${html_file}`, 'utf8', function (err, data) {
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
        fs.writeFile(`public/${html_file}`, $.html(), function (err) {
            /* Throw Error to Avoid Malformed Content */
            if (err) throw err;

            /* Log Success Message */
            console.log(`Data replaced for ${html_file}`);
        });
    });
}