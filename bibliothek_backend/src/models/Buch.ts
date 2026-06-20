import mongoose, { Schema, Document } from "mongoose";

export interface IBuch extends Document {
  titel: string;
  openLibraryKey?: string;
  erscheinungsjahr?: number;
  beschreibung?: string;
  coverBild?: string;
  autor: mongoose.Types.ObjectId;
  durchschnittsBewertung?: number;
  anzahlBewertungen?: number;
}

const buchSchema = new Schema<IBuch>({
  titel: { type: String, required: true },
  beschreibung: { type: String },
  coverBild: { type: String },
  autor: {
    type: Schema.Types.ObjectId,
    ref: "Autor",
    required: true,
  },
  openLibraryKey: {
    type: String,
    unique: true,
    sparse: true,
  },
  erscheinungsjahr: {
    type: Number,
  },
  durchschnittsBewertung: {
    type: Number,
    default: 0,
  },
  anzahlBewertungen: {
    type: Number,
    default: 0,
  },
});

export default mongoose.model<IBuch>("Buch", buchSchema);
