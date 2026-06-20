import Buch from "../models/Buch";
import Autor from "../models/Autor";
import mongoose from "mongoose";
import {
  sucheBuecherBeiOpenLibrary,
} from "../services/openLibraryService";

const ObjectId = mongoose.Types.ObjectId;

/**
 * Sonderzeichen so maskieren, dass ein Suchtext
 * sicher in einem regulären Ausdruck verwendet werden kann.
 */
function escapeRegex(suchtext: string): string {
  return suchtext.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
}

function pruefeEingeloggt(context: any): void {
  if (!context.userId) {
    throw new Error(
      "Du musst eingeloggt sein."
    );
  }
}

function pruefeAdmin(context: any): void {
  pruefeEingeloggt(context);

  if (context.rolle !== "ADMIN") {
    throw new Error(
      "Diese Aktion ist nur für Administratoren erlaubt."
    );
  }
}

/**
 * Optionalen Suchfilter für Titel oder Autor erstellen.
 */
function buildMatchStage(q?: string) {
  if (!q || !q.trim()) {
    return null;
  }

  const suchbegriff = new RegExp(
    escapeRegex(q.trim()),
    "i"
  );

  return {
    $match: {
      $or: [
        {
          titel: suchbegriff,
        },
        {
          autorName: suchbegriff,
        },
        {
          "lookupAutor.name": suchbegriff,
        },
        {
          "lookupAutor.vorname": suchbegriff,
        },
      ],
    },
  };
}

/**
 * Einen vollständigen Autorennamen für unser Datenmodell
 * in Vorname und Nachname aufteilen.
 */
function zerlegeAutorName(
  autorName: string
): {
  vorname: string;
  name: string;
} {
  const bereinigterName = autorName.trim();

  const namensTeile = bereinigterName
    .split(/\s+/)
    .filter(
      teil => teil.length > 0
    );

  if (namensTeile.length === 0) {
    return {
      vorname: "Unbekannt",
      name: "Unbekannter Autor",
    };
  }

  if (namensTeile.length === 1) {
    return {
      vorname: "Unbekannt",
      name: namensTeile[0],
    };
  }

  const nachname =
    namensTeile[
      namensTeile.length - 1
    ];

  const vornamen = namensTeile
    .slice(
      0,
      namensTeile.length - 1
    )
    .join(" ");

  return {
    vorname: vornamen,
    name: nachname,
  };
}

export const buchResolvers = {
  Query: {
    /**
     * Bücher aus der eigenen MongoDB-Bibliothek laden.
     * Die Query ist öffentlich zugänglich.
     */
    alleBuecher: async (
      _: unknown,
      args: {
        limit?: number;
        offset?: number;
        q?: string;
      }
    ) => {
      const limit = args.limit ?? 10;
      const offset = args.offset ?? 0;

      const pipeline: any[] = [
        {
          $lookup: {
            from: "autors",
            localField: "autor",
            foreignField: "_id",
            as: "lookupAutor",
          },
        },
        {
          $set: {
            lookupAutor: {
              $first: "$lookupAutor",
            },
          },
        },
      ];

      const matchStage =
        buildMatchStage(args.q);

      if (matchStage) {
        pipeline.push(matchStage);
      }

      pipeline.push(
        {
          $sort: {
            titel: 1,
            _id: 1,
          },
        },
        {
          $skip: offset,
        },
        {
          $limit: limit,
        }
      );

      return await Buch
        .aggregate(pipeline)
        .exec();
    },

    /**
     * Open Library durchsuchen.
     * Auch Gäste dürfen die öffentliche Quelle durchsuchen.
     */
    oeffentlicheBuecherSuchen: async (
      _: unknown,
      args: {
        suchbegriff: string;
      }
    ) => {
      return await sucheBuecherBeiOpenLibrary(
        args.suchbegriff
      );
    },

    /**
     * Ein einzelnes Buch inklusive Autor laden.
     * Buchdetails sollen öffentlich sichtbar sein.
     */
    gibEinBuch: async (
      _: unknown,
      args: {
        buchId: string;
      }
    ) => {
      if (!ObjectId.isValid(args.buchId)) {
        throw new Error(
          "Ungültige Buch-ID."
        );
      }

      const ergebnis = await Buch.aggregate([
        {
          $match: {
            _id: new ObjectId(
              args.buchId
            ),
          },
        },
        {
          $lookup: {
            from: "autors",
            localField: "autor",
            foreignField: "_id",
            as: "lookupAutor",
          },
        },
        {
          $set: {
            lookupAutor: {
              $first: "$lookupAutor",
            },
          },
        },
      ]);

      return ergebnis[0] || null;
    },

    /**
     * Anzahl der Bücher mit optionalem Suchfilter ermitteln.
     */
    buecherAnzahl: async (
      _: unknown,
      args: {
        autorId?: string;
        q?: string;
      }
    ) => {
      const pipeline: any[] = [];

      if (args.autorId) {
        if (!ObjectId.isValid(args.autorId)) {
          throw new Error(
            "Ungültige Autor-ID."
          );
        }

        pipeline.push({
          $match: {
            autor: new ObjectId(
              args.autorId
            ),
          },
        });
      }

      pipeline.push(
        {
          $lookup: {
            from: "autors",
            localField: "autor",
            foreignField: "_id",
            as: "lookupAutor",
          },
        },
        {
          $set: {
            lookupAutor: {
              $first: "$lookupAutor",
            },
          },
        }
      );

      const matchStage =
        buildMatchStage(args.q);

      if (matchStage) {
        pipeline.push(matchStage);
      }

      pipeline.push({
        $count: "total",
      });

      const ergebnis = await Buch
        .aggregate(pipeline)
        .exec();

      return ergebnis[0]?.total ?? 0;
    },
  },

  Mutation: {
    /**
     * Ein Buch aus Open Library in die gemeinsame
     * Bibliothek übernehmen.
     *
     * Nur Administratoren dürfen den gemeinsamen
     * Datenbestand erweitern.
     */
    oeffentlichesBuchUebernehmen: async (
      _: unknown,
      args: {
        openLibraryKey: string;
        titel: string;
        autorName: string;
        coverBild?: string;
        erscheinungsjahr?: number;
      },
      context: any
    ) => {
      pruefeAdmin(context);

      const openLibraryKey =
        args.openLibraryKey.trim();

      const titel =
        args.titel.trim();

      const autorName =
        args.autorName.trim();

      if (!openLibraryKey) {
        throw new Error(
          "Der Open-Library-Schlüssel fehlt."
        );
      }

      if (!titel) {
        throw new Error(
          "Der Buchtitel darf nicht leer sein."
        );
      }

      if (!autorName) {
        throw new Error(
          "Der Autorenname darf nicht leer sein."
        );
      }

      const bereitsVorhandenesBuch =
        await Buch.findOne({
          openLibraryKey,
        });

      if (bereitsVorhandenesBuch) {
        throw new Error(
          "Dieses Buch befindet sich bereits in der Bibliothek."
        );
      }

      const zerlegterName =
        zerlegeAutorName(autorName);

      let autor = await Autor.findOne({
        name: {
          $regex:
            "^" +
            escapeRegex(
              zerlegterName.name
            ) +
            "$",
          $options: "i",
        },
        vorname: {
          $regex:
            "^" +
            escapeRegex(
              zerlegterName.vorname
            ) +
            "$",
          $options: "i",
        },
      });

      if (!autor) {
        autor = new Autor({
          vorname:
            zerlegterName.vorname,
          name:
            zerlegterName.name,
        });

        await autor.save();
      }

      const neuesBuch = new Buch({
        titel,
        autor: autor._id,
        coverBild:
          args.coverBild,
        erscheinungsjahr:
          args.erscheinungsjahr,
        openLibraryKey,
      });

      await neuesBuch.save();

      return neuesBuch;
    },

    /**
     * Buch manuell hinzufügen.
     * Ebenfalls nur für Administratoren.
     */
    buchHinzufuegen: async (
      _: unknown,
      {
        titel,
        autorId,
      }: {
        titel: string;
        autorId: string;
      },
      context: any
    ) => {
      pruefeAdmin(context);

      const bereinigterTitel =
        titel.trim();

      if (!bereinigterTitel) {
        throw new Error(
          "Titel darf nicht leer sein."
        );
      }

      if (!ObjectId.isValid(autorId)) {
        throw new Error(
          "Ungültige Autor-ID."
        );
      }

      const autor =
        await Autor.findById(autorId);

      if (!autor) {
        throw new Error(
          "Autor wurde nicht gefunden."
        );
      }

      const neuesBuch = new Buch({
        titel: bereinigterTitel,
        autor: autor._id,
      });

      await neuesBuch.save();

      return neuesBuch;
    },

    /**
     * Buch aus dem gemeinsamen Bestand löschen.
     * Nur Administratoren dürfen dies durchführen.
     */
    buchLoeschen: async (
      _: unknown,
      {
        id,
      }: {
        id: string;
      },
      context: any
    ) => {
      pruefeAdmin(context);

      if (!ObjectId.isValid(id)) {
        throw new Error(
          "Ungültige Buch-ID."
        );
      }

      const geloeschtesBuch =
        await Buch.findByIdAndDelete(id);

      if (!geloeschtesBuch) {
        throw new Error(
          "Buch wurde nicht gefunden."
        );
      }

      return "Buch gelöscht";
    },

    /**
     * Bücher bewerten.
     * Jeder eingeloggte Nutzer darf bewerten.
     */
    bewerteBuch: async (
      _: unknown,
      {
        buchId,
        bewertung,
      }: {
        buchId: string;
        bewertung: number;
      },
      context: any
    ) => {
      pruefeEingeloggt(context);

      if (
        bewertung < 1 ||
        bewertung > 5
      ) {
        throw new Error(
          "Bewertung muss zwischen 1 und 5 Sternen liegen."
        );
      }

      if (!ObjectId.isValid(buchId)) {
        throw new Error(
          "Ungültige Buch-ID."
        );
      }

      const buch =
        await Buch.findById(buchId);

      if (!buch) {
        throw new Error(
          "Buch nicht gefunden."
        );
      }

      const alteSumme =
        (
          buch.durchschnittsBewertung ??
          0
        ) *
        (
          buch.anzahlBewertungen ??
          0
        );

      const neueAnzahl =
        (
          buch.anzahlBewertungen ??
          0
        ) + 1;

      const neuerDurchschnitt =
        (
          alteSumme +
          bewertung
        ) /
        neueAnzahl;

      buch.durchschnittsBewertung =
        Number(
          neuerDurchschnitt.toFixed(2)
        );

      buch.anzahlBewertungen =
        neueAnzahl;

      await buch.save();

      return buch;
    },
  },
};
