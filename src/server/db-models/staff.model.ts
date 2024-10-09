import { model, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import { ApplicationRole } from "./application-role.model";
import { IApplicationRole } from "../../interfaces/authentication";

interface IStaff {
  staffId: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  avatar: string;
  initializationDone: boolean;

  roleDetail: IApplicationRole;
  isValidPassword: (password: string) => boolean;
}

const staffSchema = new Schema<IStaff>({
  staffId: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    lowercase: true,
    validate(value: string) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        throw new Error("Invalid Email Address");
      }
    },
  },
  password: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  role: String,
  avatar: {
    type: String,
    required: false,
  },
  initializationDone: {
    type: Boolean,
    required: true,
    default: false,
  },
});

staffSchema.methods.isValidPassword = function (password: string) {
  return bcrypt.compareSync(password, this.password);
};

staffSchema.virtual("roleDetail", {
  ref: ApplicationRole,
  localField: "role",
  foreignField: "name",
  justOne: true,
});

export const Staff = model<IStaff>("staff", staffSchema);
