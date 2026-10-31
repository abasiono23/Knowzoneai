import nodemailer from 'nodemailer';
import { config } from '../config.js';

export type Email = {
  to: string;
  subject: string;
  text: string;
  attachments?: { filename: string; content: string }[];
};

/** Emails "sent" without a provider (development and tests). Tests read codes from here. */
export const outbox: Email[] = [];

const smtp =
  config.SMTP_USER && config.SMTP_PASS
    ? nodemailer.createTransport({
        host: config.SMTP_HOST,
        port: config.SMTP_PORT,
        secure: config.SMTP_PORT === 465,
        auth: { user: config.SMTP_USER, pass: config.SMTP_PASS },
        // Give up in seconds, not minutes, when the mail server can't be reached.
        connectionTimeout: 10_000,
        greetingTimeout: 10_000,
        socketTimeout: 20_000,
      })
    : null;

/**
 * Sends through Resend when RESEND_API_KEY is set, else through SMTP (e.g. Gmail) when SMTP_USER and
 * SMTP_PASS are set. Otherwise the email is kept in `outbox` and printed in development, so codes can be
 * read from the server log.
 */
export async function sendEmail(email: Email) {
  if (!config.RESEND_API_KEY && smtp) {
    await smtp.sendMail({
      from: config.EMAIL_FROM,
      to: email.to,
      subject: email.subject,
      text: email.text,
      attachments: email.attachments?.map((a) => ({ filename: a.filename, content: a.content })),
    });
    return;
  }
  if (!config.RESEND_API_KEY) {
    outbox.push(email);
    if (outbox.length > 100) outbox.shift();
    if (config.NODE_ENV === 'development') console.log(`\n✉️  To ${email.to}: ${email.subject}\n${email.text}\n`);
    return;
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${config.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: config.EMAIL_FROM,
      to: email.to,
      subject: email.subject,
      text: email.text,
      attachments: email.attachments?.map((a) => ({ filename: a.filename, content: Buffer.from(a.content).toString('base64') })),
    }),
  });
  if (!res.ok) throw new Error(`Email failed: ${res.status} ${await res.text()}`);
}

export const emails = {
  verify: (code: string) => ({
    subject: `${code} is your Knowzone code`,
    text: `Welcome to Knowzone!\n\nYour verification code is ${code}. It expires in 15 minutes.\n\nIf you didn’t sign up, you can ignore this email.`,
  }),
  reset: (code: string) => ({
    subject: `${code} is your Knowzone reset code`,
    text: `Someone asked to reset your Knowzone password.\n\nYour code is ${code}. It expires in 15 minutes.\n\nIf this wasn’t you, ignore this email: your password stays the same.`,
  }),
  deletion: (date: string) => ({
    subject: 'Your Knowzone account will be deleted',
    text: `We’ve scheduled your account for deletion on ${date}.\n\nChanged your mind? Just sign in before then and we’ll cancel it.`,
  }),
  waitlist: (name: string, position: number) => ({
    subject: 'You’re on the Knowzone waitlist 🎉',
    text: `Hi ${name},

Thanks for joining the Knowzone waitlist! You’re number ${position} in line.

Knowzone is an AI study app for exams and beyond: an AI tutor, JAMB, WAEC and NECO past questions, courses, study rooms with friends and learning games, in 10 languages. We’ll email you as soon as it opens.

If you didn’t sign up, or want to be taken off the list, just reply to this email.

The Knowzone team`,
  }),
  export: () => ({
    subject: 'Your Knowzone data',
    text: 'Attached is a copy of everything Knowzone holds about your account, as a JSON file.\n\nIf you didn’t ask for this, change your password and sign out your other devices in Settings.',
  }),
};
