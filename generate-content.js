/* Import / Setup Dependencies */
const cheerio = require('cheerio');
const {
    text
} = require('cheerio/lib/api/manipulation');
const fs = require('fs');
const showdown = require('showdown');
let converter = new showdown.Converter();
const {parseCollection, parseCollectionDate} = require('./collection2array.js');
const { brotliDecompressSync } = require('zlib');


/* Load Config Files */
const home_page_data = require('./content/home-page.json');
const learn_data = require('./content/learn-page.json');
const schedule_event_data = require('./content/schedule-event-page.json');
const join_club_data = require('./content/join-dj-club.json');
const gallery_data = require('./content/photo-gallery.json');
const event_page_data = require('./content/events-page.json');
const from_our_djs_data = require('./content/from-our-djs.json');
const member_resources_data = require('./content/member-resources.json');

/* Repeated Content Used on more than One Page */
const event_list_data = parseCollectionDate('./content/events-list');

/* Month Map */
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];


/* Call Page Modifiers */
gen_home('Home.html');
gen_home('index.html');
/* gen_tags(); */
gen_learn();
gen_schedule_an_event();
gen_join_dj_club();
gen_photos();
gen_events_page();
gen_from_our_djs();
gen_members();

/**
 * Add google tags script to all .html files in public directory
 */
function gen_tags()
{
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
                    console.log(`GTags Added for ${file}`);
                });
            }
            else
            {
                console.log(`GTags Already Exist for ${file}`);
            }
        });
    }
}

/* Generate Home or Index Page */
function gen_home(html_file)
{
    /* Generate Content for Home Page */
    fs.readFile(`public/${html_file}`, 'utf8', function (err, data) {
        /* Throw Error to Avoid Malformed Content */
        if (err) throw err;

        /* Load HTML data */
        let $ = cheerio.load(data);

        const TITLE = 'title'
        const SUBTITLE = 'h5.u-align-left'
        const FOR_THE_COMMUNITY = '.u-expanded-width-xs > div:nth-child(1) > p:nth-child(2)'
        const FOR_DJS = 'p.u-text-3'
        const FEATURED_IMAGE_1 = 'div.u-effect-fade:nth-child(1) > div:nth-child(1) > img:nth-child(1)'
        const FEATURED_IMAGE_2 = 'div.u-effect-fade:nth-child(2) > div:nth-child(1) > img:nth-child(1)'
        const FEATURED_IMAGE_3 = 'div.u-effect-fade:nth-child(3) > div:nth-child(1) > img:nth-child(1)'
        const LEARN_TO_DJ = '#sec-289b > div:nth-child(1) > div:nth-child(5) > div:nth-child(1) > p:nth-child(2)'
        const MEMBER_RESOURCES = 'div.u-grey-5:nth-child(2) > div:nth-child(1) > p:nth-child(2)'
        const MEMBER_BUTTON = 'div.u-grey-5:nth-child(2) > div:nth-child(1) > a:nth-child(3)'
        const FROM_OUR_DJS = '#sec-0bc9 > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > p:nth-child(2)'
        const SOCIAL_1 = 'a.u-active-none:nth-child(1)'
        const SOCIAL_2 = 'a.u-active-none:nth-child(2)'
        const SOCIAL_3 = 'a.u-active-none:nth-child(3)'
        const EVENT_CONTAINER = '.u-list'

        /* 
            Page Modifications
        */

        /* Modify Tab Title */
        $(TITLE).html(home_page_data['tab-title']);

        /* Modify Subtitle */
        $(SUBTITLE).html(home_page_data.subtitle);

        /* Modify About Section */
        inject_markdown($, FOR_THE_COMMUNITY, home_page_data['for-the-community'])

        inject_markdown($, FOR_DJS, home_page_data['for-djs']);



        /* Modify Featured Photos */
        $(FEATURED_IMAGE_1).attr('data-src', "." + home_page_data['left-image'].replace('/public', ''));
        $(FEATURED_IMAGE_1).attr('src', "." + home_page_data['left-image'].replace('/public', ''));

        $(FEATURED_IMAGE_2).attr('data-src', "." + home_page_data['middle-image'].replace('/public', ''));
        $(FEATURED_IMAGE_2).attr('src', "." + home_page_data['middle-image'].replace('/public', ''));

        $(FEATURED_IMAGE_3).attr('data-src', "." + home_page_data['right-image'].replace('/public', ''));
        $(FEATURED_IMAGE_3).attr('src', "." + home_page_data['right-image'].replace('/public', ''));

        /* Featured Events */

        /* Loop over Events or 3 Events Entries */
        let i = 0;
        let max_entries = (event_list_data.length < 3) ? event_list_data.length : 3;
        let insertion_html = '<div class="u-repeater u-repeater-1">';
        for (let entry of event_list_data) {
            /* Skip Insertion after Max Reached */
            if (i < max_entries)
            {
                /* Insert Entry Element */
                insertion_html += gen_one_event_home(entry["alt-text"], entry["display-image"],
                                    entry["event-title"], entry["event-date"], 
                                    entry["event-description"], i + 1)
            }
            else // Avoid Unneccessary Loop Executions
            {
                break;
            }
            
            i++
        }
        insertion_html += '</div>'; // Close Div

        $(EVENT_CONTAINER).html(insertion_html);


        /* Modify Learn to DJ Section Long Text */
        inject_markdown($, LEARN_TO_DJ, home_page_data['learn-to-dj']);

        /* Modify Members Section Long Text */
        inject_markdown($, MEMBER_RESOURCES, home_page_data['members-section-text']);

        $(MEMBER_BUTTON).html(home_page_data['members-section-button']); // Replace Button Text

        /* Modify From our DJs Long Text */
        inject_markdown($, FROM_OUR_DJS, home_page_data['from-our-djs'])


        /* Modify Social Links */
        $(SOCIAL_1).html(home_page_data['social-1'])
        $(SOCIAL_1).attr('href', home_page_data['social-link-1'])
        
        $(SOCIAL_2).html(home_page_data['social-2'])
        $(SOCIAL_2).attr('href', home_page_data['social-link-2'])

        $(SOCIAL_3).html(home_page_data['social-3'])
        $(SOCIAL_3).attr('href', home_page_data['social-link-3'])

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

/* Generate one Event for Home Page */
function gen_one_event_home(alt_text, image, title, date_string, description, id)
{
    /* Create Date Object*/
    let event_date = new Date(date_string);

    /* Get Hour, Minutes, and AM/PM */
    let hour = (event_date.getHours() > 12) ? {hour: event_date.getHours() % 12, ampm: "PM"} : {hour: event_date.getHours(), ampm: "AM"}
    hour["minutes"] = (event_date.getMinutes() == "0") ? "00": event_date.getMinutes();
    
    /* Format Date */
    let display_date = `${months[event_date.getMonth()]} ${event_date.getDate()}, ${event_date.getFullYear()} ${hour.hour}:${hour.minutes} ${hour.ampm}`

    /* Parse Description */
    description = description.replace('\n', '<br/>')
    let event_description = converter.makeHtml(description); // Create HTML from Markdown
    event_description = event_description.replace('<p>', ''); // Remove Paragraph Tags
    event_description = event_description.replace('</p>', '');

    return `
    <div class="u-container-style u-list-item u-repeater-item">
        <div class="u-container-layout u-similar-container u-container-layout-${id}">
        <img alt="${alt_text}" class="u-image u-image-default u-preserve-proportions u-image-${id} ls-is-cached lazyloaded" data-image-width="474" data-image-height="474" data-src="${image.replace('/public', '.')}" src="${image.replace('/public', '.')}">
        <h2 class="u-text u-text-2">${title}</h2>
        <h5 class="u-custom-font u-font-pt-sans u-text u-text-3">${display_date}</h5>
        <p class="u-text u-text-4">${event_description}</p>
        </div>
    </div>
    `
}

/* Generate Schedule an Event Page */
function gen_schedule_an_event()
{
    fs.readFile('./public/Schedule-Event.html', 'utf-8', function (err, data) {
        /* Throw Error to Avoid Malformed Content */
        if (err) throw err;

        /* Load HTML data */
        let $ = cheerio.load(data);

        /* 
            Constant Selectors
        */
       const TAB_TITLE = 'title'
       const TITLE = 'h1.u-text'
       const DESCRIPTION = 'p.u-align-center'

       /* 
            Update Page Content
        */

        /* Update Tab Title */
        $(TAB_TITLE).html(schedule_event_data["tab-title"]);

        /* Update Page Title */
        $(TITLE).html(schedule_event_data.title);

        /* Update Page Description */
        inject_markdown($, DESCRIPTION, schedule_event_data['description']);
            
        /* 
            Write Out Modified Html
        */
        /* Write out Modified HTML */
        fs.writeFile('./public/Schedule-Event.html', $.html(), function (err) {
            /* Throw Error to Avoid Malformed Content */
            if (err) throw err;

            /* Log Success Message */
            console.log(`Data replaced for Schedule-Event.html`);
        });
    })
}

/* Generate Join DJ Club Page */
function gen_join_dj_club()
{
    fs.readFile('./public/Join-DJ-Club.html', 'utf-8', function (err, data) {
        /* Throw Error to Avoid Malformed Content */
        if (err) throw err;

        /* Load HTML data */
        let $ = cheerio.load(data);

        /* 
            Constant Selectors
        */
       const TAB_TITLE = 'title'
       const TITLE = 'h1.u-text'
       const DESCRIPTION = 'p.u-align-center'
       const GROUPME_IMAGE = 'img.u-image:nth-child(3)'

       /* 
            Update Page Content
        */

        /* Update Tab Title */
        $(TAB_TITLE).html(join_club_data["tab-title"]);

        /* Update Page Title */
        $(TITLE).html(join_club_data.title);

        /* Update Page Description */
        inject_markdown($, DESCRIPTION, join_club_data['description']);

        /* Update GroupMe Link */
        $(GROUPME_IMAGE).html(join_club_data["groupme-link"])
            
        /* 
            Write Out Modified Html
        */
        /* Write out Modified HTML */
        fs.writeFile('./public/Join-DJ-Club.html', $.html(), function (err) {
            /* Throw Error to Avoid Malformed Content */
            if (err) throw err;

            /* Log Success Message */
            console.log(`Data replaced for Join-DJ-Club.html`);
        });
    })
}

/* Generate Photos Page */
function gen_photos()
{
    fs.readFile('public/Photos.html', 'utf-8', function (err, data) {
        /* Throw Error to Avoid Malformed Content */
        if (err) throw err;

        /* Load HTML data */
        let $ = cheerio.load(data);

        /* 
            Page Constants
        */

        const TAB_TITLE = 'title'
        const TITLE = 'h1.u-text'
        const DESCRIPTION = 'p.u-text:nth-child(2)'
        const PHOTO_CONTAINER = '#carousel-f242'

        /* 
            Update Content
        */

        /* Update Tab Title */
        $(TAB_TITLE).html(gallery_data['tab-title'])

        /* Update Page Title (h1) */
        $(TITLE).html(gallery_data.title)

        /* Update Description */
        inject_markdown($, DESCRIPTION, gallery_data['description']);

        /* 
            Update Repeated Content
        */
        
        /* Fetch Learning Entry Data */
        const photos_repeated_data = parseCollection('./content/gallery');

        /* Loop over Learning Entries */

        let i = 0;
        let insertion_html = '';
        for (let entry of photos_repeated_data) {
            /* Insert Repeater Element (3 elements / row) */
            if (i % 3 == 0 && i > 0) insertion_html += `<div class="u-gallery-inner u-gallery-inner-1" role="listbox" style="padding-top: 20px !important;">`
            else if (i % 3 == 0) insertion_html += `<div class="u-gallery-inner u-gallery-inner-1" role="listbox">`

            /* Insert Entry Element */
            insertion_html += gen_single_photo(entry["alt-text"], entry["display-image"].replace('/public', '.'), i);

            /* Close Div if End of Line or Last Element */
            if (i % 3 == 2 || i == photos_repeated_data.length) insertion_html += `</div>`
            i++
        }

        /* Insert Html into container */
        $(PHOTO_CONTAINER).html(insertion_html)
       
        

        /* 
            Write Out Content
        */
        fs.writeFile('public/Photos.html', $.html(), function (err) {
            /* Throw Error to Avoid Malformed Content */
            if (err) throw err;

            /* Log Success Message */
            console.log(`Data replaced for Photos.html`);
        });
    })
}

/* Create a Single Photo Entry */
function gen_single_photo(alt_text, display_image, id)
{
    return `
        <div class="u-gallery-item u-gallery-item-${id}">
            <div class="u-back-slide">
            <img class="u-back-image u-expanded lazyload" alt="${alt_text}" data-src="${display_image}">
            </div>
            <div class="u-align-center u-over-slide u-valign-bottom u-over-slide-${id}">
            <h3 class="u-gallery-heading"></h3>
            <p class="u-gallery-text"></p>
            </div>
        </div>
    `
}

function gen_events_page()
{
    fs.readFile('public/Events.html', 'utf-8', function(err, data) {
        /* Throw Error to Avoid Malformed Content */
        if (err) throw err;

        /* Load HTML data */
        let $ = cheerio.load(data);

        /* 
            Constant Selectors
        */

        const TAB_TITLE = 'title'
        const TITLE = 'h1.u-text'
        const DESCRIPTION = 'p.u-text:nth-child(2)'
        const SCHEDULE_BUTTON = '.u-border-2'
        const EVENT_CONTAINER = '.u-expanded-width'

        /* 
            Content Updates
        */

        /* Update Tab Title */
        $(TAB_TITLE).html(event_page_data['tab-title']);

        /* Update Page Title (h1) */
        $(TITLE).html(event_page_data.title);

        /* Update Description */
        inject_markdown($, DESCRIPTION, gallery_data['description']);

        /* Update Schedule Button */
        $(SCHEDULE_BUTTON).html(event_page_data['schedule-button']);
        $(SCHEDULE_BUTTON).attr('href', 'Schedule-Event.html')

        /* 
            Update Repeated Content
        */

        /* Loop over Events or 10 Events Entries */
        let i = 0;
        let max_entries = (event_list_data.length < 10) ? event_list_data.length : 10;
        let insertion_html = '<div class="u-repeater u-repeater-1">';
        for (let entry of event_list_data) {
            /* Skip Insertion after Max Reached */
            if (i < max_entries)
            {
                /* Insert Entry Element */
                insertion_html += gen_one_event(entry["alt-text"], entry["display-image"],
                                    entry["event-title"], entry["event-date"], 
                                    entry["event-description"], i + 1)
            }
            else // Avoid Unneccessary Loop Executions
            {
                break;
            }
            
            i++
        }
        insertion_html += '</div>' // Close Div

        $(EVENT_CONTAINER).html(insertion_html)

        /* 
            Write Out Content
        */
       /* Write out Modified HTML */
       fs.writeFile('public/Events.html', $.html(), function (err) {
        /* Throw Error to Avoid Malformed Content */
        if (err) throw err;

        /* Log Success Message */
        console.log(`Data replaced for Events.html`);
    });
    })
}

/* Create a Single Event Entry */
function gen_one_event(alt_text, image, title, date_string, description, id)
{
    /* Create Date Object*/
    let event_date = new Date(date_string);

    /* Get Hour, Minutes, and AM/PM */
    let hour = (event_date.getHours() > 12) ? {hour: event_date.getHours() % 12, ampm: "PM"} : {hour: event_date.getHours(), ampm: "AM"}
    hour["minutes"] = (event_date.getMinutes() == "0") ? "00": event_date.getMinutes();
    
    /* Format Date */
    let display_date = `${months[event_date.getMonth()]} ${event_date.getDate()}, ${event_date.getFullYear()} ${hour.hour}:${hour.minutes} ${hour.ampm}`

    /* Parse Description */
    description = description.replace('\n', '<br/>');
    let event_description = converter.makeHtml(description); // Create HTML from Markdown
    event_description = event_description.replace('<p>', ''); // Remove Paragraph Tags
    event_description = event_description.replace('</p>', '');

    return `
        <div class="u-container-style u-list-item u-repeater-item">
            <div class="u-container-layout u-similar-container u-container-layout-${id}">
            <img alt="${alt_text}" class="u-image u-image-default u-preserve-proportions u-image-${id} ls-is-cached lazyloaded" data-image-width="474" data-image-height="474" data-src="${image.replace('/public', '.')}" src="${image.replace('/public', '.')}">
            <h2 class="u-text u-text-white u-text-3">${title}</h2>
            <h5 class="u-custom-font u-font-pt-sans u-text u-text-white u-text-4">${display_date}</h5>
            <p class="u-text u-text-white u-text-5">${event_description}</p>
            </div>
        </div>
    `
}

/* Generate Learn-to-DJ page */
function gen_learn() 
{
    fs.readFile('public/Learn-to-Mix.html', 'utf-8', function (err, data) {
        /* Throw Error to Avoid Malformed Content */
        if (err) throw err;

        /* Load HTML data */
        let $ = cheerio.load(data);


        /* 
            Constant Selectors 
        */
        const ENTRY_CONTAINER = 'div.u-expanded-width';
        const TAB_TITLE = 'title'
        const TITLE = 'h1.u-text'
        const DESCRIPTION = 'p.u-text:nth-child(2)'


        /* 
            Update Page Content 
        */

        /* Update Tab Title */
        $(TAB_TITLE).html(learn_data['tab-title'])

        /* Update Page Title (h1) */
        $(TITLE).html(learn_data.title);

        /* Update Description */
        inject_markdown($, DESCRIPTION, learn_data.description);


        /* 
            Update Repeated Content 
        */

        /* Fetch Learning Entry Data */
        const learning_repeated_data = parseCollection('./content/learning');

        /* Loop over Learning Entries */

        let i = 0;
        let insertion_html = '';
        for (let entry of learning_repeated_data) {
            /* Insert Repeater Element (3 elements / row) */
            if (i % 3 == 0 && i > 0) insertion_html += `<div class="u-repeater u-repeater-1" style="padding-top: 60px !important;">`
            else if (i % 3 == 0) insertion_html += `<div class="u-repeater u-repeater-1">`

            /* Insert Entry Element */
            insertion_html += gen_learn_entry(entry["alt-text"], entry["display-image"],
                entry.title, entry.description,
                entry["link-text"], entry.link);

            /* Close Div if End of Line or Last Element */
            if (i % 3 == 2 || i == learning_repeated_data.length) insertion_html += `</div>`
            i++
        }

        /* Insert Html into container */
        $(ENTRY_CONTAINER).html(insertion_html)



        /* Write out Modified HTML */
        fs.writeFile('public/Learn-to-Mix.html', $.html(), function (err) {
            /* Throw Error to Avoid Malformed Content */
            if (err) throw err;

            /* Log Success Message */
            console.log(`Data replaced for Learn-to-Mix.html`);
        });
    });
}

/* Generate One Learning Entry */
function gen_learn_entry(alt_text, display_image, title, description_md, link_text, link)
{
    description_md = description_md.replace('\n', '<br/>')
    let description_html = converter.makeHtml(description_md);
    description_html = description_html.replace('<p>', '');
    description_html = description_html.replace('</p>', '');
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

/* Generate from Our DJs Page */
function gen_from_our_djs()
{
    fs.readFile('./public/From-Our-DJs.html', 'utf-8', function (err, data) {
        /* Throw Error to Avoid Malformed Content */
        if (err) throw err;

        /* Load HTML data */
        let $ = cheerio.load(data);

        /* 
            Constant Selectors
        */
        const TAB_TITLE = 'title'
        const TITLE = 'h1.u-align-center'
        const DESCRIPTION = 'p.u-align-center'
        const MUSIC_CONTAINER = '.u-layout'

        /* 
            Content Modifications
        */
        
        /* Replace Tab Title */
        $(TAB_TITLE).html(from_our_djs_data['tab-title']);

        /* Replace Page Title (h1) */
        $(TITLE).html(from_our_djs_data.title);

        /* Replace Description */
        inject_markdown($, DESCRIPTION, from_our_djs_data.description);

        /* 
            Repeated Content
        */

        /* Fetch Learning Entry Data */
        const embed_data = parseCollection('./content/from-our-djs-entry');

        /* Loop over Learning Entries */

        let i = 0;
        let insertion_html = '';
        for (let entry of embed_data) {
            /* Insert Repeater Element (3 elements / row) */
            if (i % 3 == 0 && i > 0) insertion_html += `<div class="u-layout-row">`
            else if (i % 3 == 0) insertion_html += `<div class="u-layout-row">`

            /* Insert Entry Element */
            insertion_html += gen_one_music_embed(entry["embed-code"], i + 1);

            /* Close Div if End of Line or Last Element */
            if (i % 3 == 2 || i == embed_data.length) insertion_html += `</div>`
            i++
        }

        /* Write out Modified HTML */
        fs.writeFile('./public/From-Our-DJs.html', $.html(), function (err) {
            /* Throw Error to Avoid Malformed Content */
            if (err) throw err;

            /* Log Success Message */
            console.log(`Data replaced for From-Our-DJs.html`);
        });
    })
}

/* Generate One Embedded Music Entry */
function gen_one_music_embed(embed_code, id)
{
    return `
    <div class="u-container-style u-layout-cell u-size-20 u-layout-cell-${id}">
        <div class="u-container-layout u-container-layout-${id}">
        <div class="u-clearfix u-custom-html u-custom-html-${id}">
            ${embed_code}
        </div>
        </div>
    </div>
    `
}

/* Generate Members Only Page */
function gen_members()
{
    fs.readFile('./members_template.html', 'utf-8', function (err, data) {
        /* Throw Error to Avoid Malformed Content */
        if (err) throw err;

        /* Load HTML data */
        let $ = cheerio.load(data);

        /* 
            Constant Selectors
        */
        const TAB_TITLE = 'title'
        const TITLE = 'h1.u-text'
        const DESCRIPTION = 'p.u-text:nth-child(2)'
        const MUSIC_SOURCE_CONTAINER = '.u-expanded-width'

        /* 
            Update Content
        */
        
        /* Update Tab Title */
        $(TAB_TITLE).html(member_resources_data["tab-title"]);

        /* Update Page Title (h1) */
        $(TITLE).html(member_resources_data["title"]);

        /* Update Description */
        inject_markdown($, DESCRIPTION, member_resources_data["description"]);

        /* 
            Update Repeated Content
        */

        /* Write out Modified HTML */
        fs.writeFile('./public/Members.html', $.html(), function (err) {
            /* Throw Error to Avoid Malformed Content */
            if (err) throw err;

            /* Log Success Message */
            console.log(`Data replaced for Members.html`);
        });
    })
}

/* Generate One Members only Music Source */
function gen_one_music_source()
{
    return `
    
    `
}

/* Inject Markdown into Page */
function inject_markdown($, selector, markdown)
{
    /* Replace Icky New Lines with Link Breaks */
    markdown = markdown.replace('\n', '<br/>');
    let parsed_html = converter.makeHtml(markdown); // Create HTML from Markdown
    parsed_html = parsed_html.replace('<p>', ''); // Remove Paragraph Tags
    parsed_html = parsed_html.replace('</p>', '');
    $(selector).html(parsed_html);
}