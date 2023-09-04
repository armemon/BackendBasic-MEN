import {createTransport} from 'nodemailer';

export const sendMail = async (email, subject, text) => {
  const transport = createTransport({
    // host: process.env.SMTP_HOST,
    // port: process.env.SMTP_PORT,
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transport.sendMail({
    from: process.env.SMTP_USER,
    to: process.env.SMTP_USER,
    subject,
    text, 
  });
};

// SMTP_USER=b91bffe0b0a9f9
// SMTP_PASS=bd5abeef02fcda

// SMTP_USER="nodemailermail606@gmail.com"
// SMTP_PASS="passwordForAbhi"

// SMTP_USER="armemondeveloper@gmail.com"
// SMTP_PASS="tsawqawqfdaklrcf"
