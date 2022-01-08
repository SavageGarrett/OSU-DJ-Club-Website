import { encrypt } from 'pagecrypt'

try {
    await encrypt('./public/Members.html', './public/Members.html', 'password123');
} catch (error) {
    console.log(error)
}
