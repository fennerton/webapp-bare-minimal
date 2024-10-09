import {model, Schema} from "mongoose";
import {ApplicationRight, IApplicationRight} from "./application-right.model";

export interface IApplicationRole {
  name: string;
  devOnly: boolean;
  rights: string[];
  canCUDRight: boolean;

  associatedRights: IApplicationRight[]
}

const applicationRoleSchema = new Schema<IApplicationRole>({
  name: {
    type: String,
    trim: true,
    unique: true,
    required: [true, 'Role Name must not be null'],
  },
  devOnly: {
    // role with devOnly true will not be migrated into production
    // role with devOnly will automatically gain all rights
    // role with devOnly will hide from role list in UI
    type: Boolean,
    default: false,
  },
  rights: [String],
  canCUDRight: {
    type: Boolean,
    default: false,
  },
});

applicationRoleSchema.virtual('associatedRights', {
  ref: ApplicationRight,
  localField: 'rights',
  foreignField: 'name',
  justOne: true,
});

export const ApplicationRole = model<IApplicationRole>('application-role', applicationRoleSchema);