import {SES} from "@aws-sdk/client-ses";

const ses = new SES({
  region: "us-east-1",
  apiVersion: '2018-09-05',
});

const sendEmail = async (to: string | [string], subject: string, content: string) => {
  const params = {
    Destination: {
      ToAddresses: Array.isArray(to) ? to : [to]
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: content
        }
      },
      Subject: {
        Charset: "UTF-8",
        Data: subject
      }
    },
    Source: 'system@biostation-app.com',
  };
  await ses.sendEmail(params);
}