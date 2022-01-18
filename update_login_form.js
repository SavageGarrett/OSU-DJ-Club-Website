const fs = require('fs');
const cheerio = require('cheerio');
const password_page_data = require('./content/member-resources.json');

gen_login();

function gen_login()
{
    fs.readFile('./public/Members.html', 'utf-8', function (err, data) {
        /* Throw Error to Avoid Malformed Content */
        if (err) throw err;

        /* Load HTML data */
        let $ = cheerio.load(data);

        /* 
            Constant Selectors
        */
        const TAB_TITLE = 'title'
        const PASSWORD_MESSAGE = '#msg'
        const PAGECRYPT = '.fixed'

        /* 
            Update Content
        */

        /* Update Tab Title */
        $(TAB_TITLE).html("Access Member Resources")

        /* Update Password Prompt */
        $(PASSWORD_MESSAGE).html(password_page_data["password-prompt"])

        /* Pagecrypt */
        $(PAGECRYPT).html('');

        /* Write out Modified HTML */
        fs.writeFile('./public/Members.html', $.html(), function (err) {
            /* Throw Error to Avoid Malformed Content */
            if (err) throw err;

            /* Log Success Message */
            console.log(`Data replaced for Members.html password Page`);
        });
    })

}