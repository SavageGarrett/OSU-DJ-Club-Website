import { encrypt } from 'pagecrypt'
import fs from 'fs'

let password_data_string = fs.readFileSync('./content/member-resources.json', 'utf-8');
let password_data = JSON.parse(password_data_string);

try {
    await encrypt('./public/Members.html', './public/Members.html', password_data['password']);
} catch (error) {
    console.log(error)
}
