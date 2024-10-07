import express from "express";
import ViteExpress from "vite-express";
import {isError, mongoose} from 'bridge-mongo';
import dotenv from 'dotenv';
import {DB} from './db-schemas';
import bodyParser from 'body-parser';
import {SES} from "@aws-sdk/client-ses";

dotenv.config();

const app = express();

const jsonParser = bodyParser.json()

const ses = new SES({
    region: "us-east-1",
    apiVersion: '2018-09-05',
});

app.get("/email-template", async (_, res) => {
    // get all templates from the database
    const templates = await DB.emailtemplate.find({});
    res.send(templates);
});

app.post("/email-template", jsonParser, async (req, res) => {
    // create a new template in the database
    const {name, html, design} = req.body;
    const newTemplate = await DB.emailtemplate.create({name, html, design});
    res.send({id: newTemplate._id});
});

app.put("/email-template/:id", jsonParser, async (req, res) => {
    // create a new template in the database
    const {name, html, design} = req.body;
    const {id} = req.params;
    await DB.emailtemplate.findByIdAndUpdate(id, {name, html, design});
    res.send(200);
});

app.post("/send-email", jsonParser, async (req, res) => {
    const {templateId, to, firstName, lastName} = req.body;
    const templateQuery = await DB.emailtemplate.findOne({_id: templateId});
    if (isError(templateQuery)) {
        res.status(404).send("Template not found");
        return;
    }
    const {name, html} = templateQuery;

    const finalHtml = html.replace("{{first_name}}", firstName).replace("{{last_name}}", lastName);
    const params = {
        Destination: {
            ToAddresses: [to]
        },
        Message: {
            Body: {
                Html: {
                    Charset: "UTF-8",
                    Data: finalHtml
                }
            },
            Subject: {
                Charset: "UTF-8",
                Data: name
            }
        },
        Source: 'system@biostation-app.com',
    };
    ses.sendEmail(params, (err: { stack: any; }, data: any) => {
        if (err) {
            console.log(err, err.stack);
            res.status(500).send("Failed to send email");
        } else {
            res.send("Email sent");
        }
    });
});

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DB_CONNECTION_STRING as string);
        console.log('MongoDB connected...');
    } catch (err: any) {
        console.error(err.message);
        process.exit(1);
    }
};

connectDB();

ViteExpress.listen(app, 3000, () =>
    console.log("Server is listening on port 3000..."),
);
