import { createDB, Schema } from 'bridge-mongo';

// Defining a User Schema
const emailTemplateSchema = new Schema({
    name: { type: String, required: true },
    html: { type: String, required: true },
    design: { type: Object, required: true },
});

export const DB = createDB({
    EmailTemplate: emailTemplateSchema,
});
