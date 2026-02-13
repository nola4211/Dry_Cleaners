import sendgrid from "@sendgrid/mail";
import Mailgun from "mailgun.js";
import formData from "form-data";

const provider = process.env.MAIL_PROVIDER || "sendgrid";

const initSendgrid = () => {
  const apiKey = process.env.SENDGRID_API_KEY;
  sendgrid.setApiKey(apiKey);
  return sendgrid;
};

const initMailgun = () => {
  const apiKey = process.env.MAILGUN_API_KEY;
  const mailgun = new Mailgun(formData);
  return mailgun.client({ username: "api", key: apiKey, url: "https://api.mailgun.net" });
};

export const sendEmail = async (to, content) => {
  const from = process.env.MAIL_FROM;
  const subject = process.env.MAIL_SUBJECT || "Regarding your job posting";

  if (provider === "mailgun") {
    const client = initMailgun();
    const response = await client.messages.create(process.env.MAILGUN_DOMAIN, {
      from,
      to,
      subject,
      text: content
    });
    return response.id || response.message || "mailgun";
  }

  const client = initSendgrid();
  const response = await client.send({
    to,
    from,
    subject,
    text: content
  });
  return response[0]?.headers?.["x-message-id"] || "sendgrid";
};
