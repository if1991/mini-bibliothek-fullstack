import mongoose, { Schema, Document } from "mongoose";

export interface IAutor extends Document {
  name: string;
  vorname: string;
  geburtsdatum?: string;
  land?: string;
}

const AutorSchema = new Schema<IAutor>({
  name: { type: String, required: true },
  vorname: { type: String, required: true },
  geburtsdatum: String,
  land: String,
});

const Autor = mongoose.model<IAutor>("Autor", AutorSchema);

export default Autor;
