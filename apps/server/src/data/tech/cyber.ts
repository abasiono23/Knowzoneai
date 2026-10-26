/**
 * Cyber Defender: messages, passwords and everyday situations to judge. Brands are made up (no real
 * companies). `level` is the first level an item can come up on; `why` is shown after answering.
 */
export type CyberItem = {
  id: string;
  kind: 'email' | 'sms' | 'password' | 'situation';
  level: number;
  from?: string;
  subject?: string;
  body: string;
  link?: string;
  /** email/sms: phishing | safe; password: weak | strong; situation: risky | safe. */
  answer: 'phishing' | 'safe' | 'weak' | 'strong' | 'risky';
  why: string;
};

const email = (id: string, level: number, from: string, subject: string, body: string, link: string | undefined, answer: 'phishing' | 'safe', why: string): CyberItem => ({
  id,
  kind: 'email',
  level,
  from,
  subject,
  body,
  link,
  answer,
  why,
});
const sms = (id: string, level: number, from: string, body: string, link: string | undefined, answer: 'phishing' | 'safe', why: string): CyberItem => ({
  id,
  kind: 'sms',
  level,
  from,
  body,
  link,
  answer,
  why,
});
const password = (id: string, level: number, body: string, answer: 'weak' | 'strong', why: string): CyberItem => ({ id, kind: 'password', level, body, answer, why });
const situation = (id: string, level: number, body: string, answer: 'risky' | 'safe', why: string): CyberItem => ({ id, kind: 'situation', level, body, answer, why });

export const CYBER: CyberItem[] = [
  // Emails
  email('e1', 1, 'support@kobo-bank.secure-login.ru', 'Your account is LOCKED!', 'We noticed strange activity. Click below within 1 hour or your account will be closed.', 'http://kobo-bank.secure-login.ru/verify', 'phishing', 'The address isn’t the bank’s real website, it rushes you (“within 1 hour”) and threatens you. Real banks don’t ask you to log in from an email link.'),
  email('e2', 1, 'prizes@w1nner-promo.com', 'Congratulations, you won a phone!', 'You were picked at random to win a new phone. Just pay ₦2,000 delivery and send your bank PIN to claim it.', undefined, 'phishing', 'You can’t win a contest you didn’t enter, and no real prize asks for your PIN or a fee.'),
  email('e3', 1, 'teacher@your-school.edu.ng', 'Homework for Monday', 'Hello class, please read chapter 4 and answer questions 1 to 5. See you on Monday.', undefined, 'safe', 'It comes from your school’s address, asks for nothing personal and has no strange links.'),
  email('e4', 2, 'security@streamflix-help.co', 'Payment failed: update your card', 'Your StreamFlix payment failed. Update your card details here to avoid losing your account.', 'http://streamflix-help.co/billing', 'phishing', 'The sender and link are not the real streamflix website. Go to the app or type the address yourself instead.'),
  email('e5', 2, 'no-reply@knowzone.ai', 'Your weekly learning summary', 'You learned for 3 hours this week and kept a 5-day streak. Keep it up!', undefined, 'safe', 'It comes from the real address, gives you information and asks for nothing.'),
  email('e6', 2, 'it-support@your-school.edu.ng.mailbox-check.net', 'Mailbox full', 'Your school mailbox is full. Log in here with your password to get more space.', 'http://mailbox-check.net/login', 'phishing', 'The real school address is hidden inside a different website (mailbox-check.net). The IT team won’t ask for your password by email.'),
  email('e7', 3, 'ceo@swiftpay.com', 'Urgent and private', 'I’m in a meeting and can’t talk. Please buy 5 gift cards and send me the codes. Don’t tell anyone.', undefined, 'phishing', 'Secret, urgent requests for gift cards are a classic scam, even when the name looks important.'),
  email('e8', 3, 'orders@shoplink.com', 'Your order has shipped', 'Your order #4821 is on its way. Track it in the ShopLink app.', undefined, 'safe', 'It doesn’t ask you to click a link or share anything: it tells you to use the app you already have.'),
  email('e9', 3, 'scholarships@educ-grants.org', 'You qualify for a ₦500,000 scholarship', 'Fill in your BVN, bank account and password on our form to receive the money today.', 'http://educ-grants.org/form', 'phishing', 'Real scholarships never need your bank password, and “today” pressure is a warning sign.'),
  email('e10', 4, 'accounts@kobobank.com', 'Statement for October', 'Your monthly statement is ready. Log in to the Kobo Bank app to view it. We will never ask for your PIN.', undefined, 'safe', 'It sends you to the real app, reminds you they never ask for your PIN, and has no link to click.'),
  email('e11', 4, 'helpdesk@micros0ft-support.com', 'Virus found on your computer', 'Call this number now so our technician can remotely fix your computer.', undefined, 'phishing', 'The 0 in “micros0ft” is a fake look-alike. Companies don’t email you about viruses on your own computer.'),
  email('e12', 5, 'friend.ade@mail.com', 'Look at this photo of you!!', 'Haha is this you?? Open the file to see.', 'photo_of_you.jpg.exe', 'phishing', 'The file ends in .exe, which is a program, not a photo. Friends’ accounts get hacked too.'),

  // Text messages
  sms('s1', 1, '+234 901 000 0000', 'Your SIM will be blocked today. Reply with your NIN and date of birth to keep it active.', undefined, 'phishing', 'Your network won’t ask for your NIN by text, and threats to block you are a pressure trick.'),
  sms('s2', 1, 'Mum', 'Don’t forget to buy bread on your way home 😊', undefined, 'safe', 'A normal message from someone you know, asking for nothing private.'),
  sms('s3', 2, 'DELIVERY', 'Your parcel is waiting. Pay ₦500 customs fee here: bit.ly/pkg-fee-ng', 'bit.ly/pkg-fee-ng', 'phishing', 'A short link that hides where it goes, plus a surprise fee for a parcel you weren’t expecting.'),
  sms('s4', 2, 'KoboBank', 'Your OTP is 482913. Do not share it with anyone, including bank staff.', undefined, 'safe', 'A one-time code you asked for, with a warning not to share it. Never give this code to anyone who calls you.'),
  sms('s5', 3, '+44 7700 900123', 'Hi it’s your cousin, I lost my phone. This is my new number, can you send me ₦10,000 urgently?', undefined, 'phishing', 'A “new number” asking for money urgently: call your cousin on their old number to check first.'),
  sms('s6', 3, 'SchoolPortal', 'Exam results are now on the school portal. Log in from the school website.', undefined, 'safe', 'It doesn’t include a link: it tells you to go to the website you already know.'),
  sms('s7', 4, 'GiftZone', 'You have been selected for free data! Click to claim 10GB: free-data-ng.xyz', 'free-data-ng.xyz', 'phishing', 'Free things for clicking a strange link is bait. Data comes from your network’s own app or USSD code.'),
  sms('s8', 5, 'KoboBank', 'A ₦45,000 transfer is pending. If this wasn’t you, call us on the number on the back of your card.', undefined, 'safe', 'It asks you to use the number on your own card, not one in the message, which is the safe way to check.'),

  // Passwords
  password('p1', 1, 'password123', 'weak', 'One of the most common passwords in the world: it’s guessed in seconds.'),
  password('p2', 1, 'Tobi2010', 'weak', 'A name and a birth year are easy to guess from social media.'),
  password('p3', 1, 'purple-mango-river-42!', 'strong', 'Long, with random words, a number and a symbol: hard to guess but easy to remember.'),
  password('p4', 2, 'qwerty', 'weak', 'Keyboard patterns are among the first things attackers try.'),
  password('p5', 2, 'Gr8!Lagos#Sun*Rise', 'strong', 'Long and mixed: capitals, small letters, numbers and symbols.'),
  password('p6', 3, '11111111', 'weak', 'Eight of the same number is guessed instantly.'),
  password('p7', 3, 'my dog eats jollof at 7', 'strong', 'A long passphrase is very strong, and it’s yours to remember.'),
  password('p8', 4, 'Football!', 'weak', 'A single common word with a symbol at the end is still easy to crack.'),

  // Situations
  situation('x1', 1, 'A website asks you to make a password, and you use the same one as your email.', 'risky', 'If one site leaks it, attackers try it everywhere. Use a different password for each account.'),
  situation('x2', 1, 'You turn on two-step verification (a code on your phone) for your email.', 'safe', 'Even if someone learns your password, they’d also need your phone.'),
  situation('x3', 1, 'A classmate asks for your password “just to check something”.', 'risky', 'Passwords are private, even with friends. Change it if you shared it.'),
  situation('x4', 2, 'You leave your laptop unlocked in the library while you get water.', 'risky', 'Anyone could use your accounts. Lock the screen (Windows key + L) whenever you walk away.'),
  situation('x5', 2, 'You update your phone when it asks to install security updates.', 'safe', 'Updates fix holes that attackers use. Install them soon.'),
  situation('x6', 3, 'You log in to your bank on free café Wi-Fi with no password.', 'risky', 'Open Wi-Fi can be watched. Use mobile data for banking.'),
  situation('x7', 3, 'You post a photo of your new ID card online.', 'risky', 'ID numbers and photos can be used to pretend to be you.'),
  situation('x8', 4, 'You check a link by holding your finger on it to see the real address first.', 'safe', 'Seeing where a link really goes before opening it catches many fakes.'),
  situation('x9', 4, 'A pop-up says “Your phone has 3 viruses! Install this app now”.', 'risky', 'Scary pop-ups push you to install harmful apps. Close the page.'),
  situation('x10', 5, 'You back up your school project to the cloud and to a USB drive.', 'safe', 'Two copies in different places protect your work if one is lost or locked by ransomware.'),
];
