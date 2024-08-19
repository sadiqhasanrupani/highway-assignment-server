import mail from "./main.config";
import dotenv from "dotenv";
dotenv.config();

import { Message } from "../../types";

export const mailSend = (message: Message) => {
  return mail.sendMail({
    from: message.from || `${process.env.MESSAGE_FROM} <${process.env.EMAIL}>`,
    to: message.to,
    subject: message.subject,
    html: message.htmlMessage,
  });
};
