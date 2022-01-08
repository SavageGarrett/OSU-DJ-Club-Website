import { encrypt } from 'pagecrypt'

try {
    await encrypt('../public/Members.html', '../public/Members1.html', 'password123');
} catch (error) {
    console.log(error)
}
