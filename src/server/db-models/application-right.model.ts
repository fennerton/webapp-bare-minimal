import {model, Schema} from "mongoose";

export interface IApplicationRight {
  name: string,
  description: string,
  group: string,
}

const applicationRightSchema = new Schema<IApplicationRight>({
  name: {
    type: String,
    trim: true,
    unique: true,
    required: [true, 'Right Name must not be null'],
  },
  description: String,
  group: String,
});

export const ApplicationRight =  model<IApplicationRight>('application-right', applicationRightSchema);