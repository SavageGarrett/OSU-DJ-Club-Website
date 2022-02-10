const fs = require('fs')
const cheerio = require('cheerio');


gen_tags();

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