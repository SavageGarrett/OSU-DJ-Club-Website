import { encrypt } from 'pagecrypt'
import password_page_data from './content/member-resources.json';

try {
    await encrypt('./public/Members.html', './public/Members.html', password_page_data["password"]);
} catch (error) {
    console.log(error)
}
