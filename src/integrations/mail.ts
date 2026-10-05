export type MailMessage = {
  to: string;
  subject: string;
  body: string;
};

export type MailPort = {
  send(message: MailMessage): Promise<void>;
};

export const mail: MailPort = {
  async send() {
    return undefined;
  },
};
