import mongoose, {
  Schema,
  Document,
  Types,
} from "mongoose";
import { IBuch } from "./Buch";

export type BenutzerRolle = "USER" | "ADMIN";

export interface IUser extends Document {
  name: string;
  vorname: string;
  email: string;
  password: string;
  rolle: BenutzerRolle;
  persoenlicheListe: (Types.ObjectId | IBuch)[];
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
  },
  vorname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  rolle: {
    type: String,
    enum: ["USER", "ADMIN"],
    default: "USER",
    required: true,
  },
  persoenlicheListe: [
    {
      type: Schema.Types.ObjectId,
      ref: "Buch",
    },
  ],
});

export default mongoose.model<IUser>(
  "User",
  userSchema
);