import 'dotenv/config';
import { sendReminderEmail } from './src/services/emailService.js';

async function testEmail() {
  console.log('Sending email...');
  const start = Date.now();
  try {
    await sendReminderEmail('yashrkm38691@gmail.com', 'google', 'PayBoy', 'test note');
    console.log('Email sent successfully in', Date.now() - start, 'ms');
  } catch (error) {
    console.error('Failed to send email after', Date.now() - start, 'ms:', error);
  }
}

testEmail();
