export interface IBuch {
_id: string;
  id?: string;
  titel: string;
  beschreibung?: string;
  coverBild?: string;
  erscheinungsjahr?: number;
  durchschnittsBewertung?: number;
  anzahlBewertungen?: number;
  autor?: IAutor;
}

export interface IAutor {
  _id: string
  name: string
  vorname: string
  geburtsdatum?: string
  land?: string
  buecher?: IBuch[]
}
export type BenutzerRolle = "USER" | "ADMIN";

export interface IUser {
  _id: string
  name: string
  vorname: string
  rolle: BenutzerRolle;
  email: string
  persoenlicheListe?: IBuch[]
}