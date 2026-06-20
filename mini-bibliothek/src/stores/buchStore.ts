import type { IBuch } from '../types/models';
import { defineStore } from "pinia";
import { useAuthStore } from "./authStore";

export interface IOeffentlichesBuch {
  openLibraryKey: string;
  titel: string;
  autorName: string;
  erscheinungsjahr?: number;
  coverBild?: string;
}

interface IBuchState {
  buecher: IBuch[];
  buecherGesamt: number;
  oeffentlicheBuecher: IOeffentlichesBuch[];
  oeffentlicheBuecherWerdenGeladen: boolean;
  oeffentlicheBuecherFehler: string;
}

const GRAPHQL_ENDPOINT = "http://localhost:4000/graphql";

export const useBuchStore = defineStore("buch", {
  state: (): IBuchState => ({
  buecher: [],
  buecherGesamt: 0,
  oeffentlicheBuecher: [],
  oeffentlicheBuecherWerdenGeladen: false,
  oeffentlicheBuecherFehler: "",
}),

  getters: {
    anzahlBuecher: state => state.buecher.length,
  },

  actions: {
    async oeffentlichesBuchUebernehmen(
  buch: IOeffentlichesBuch
): Promise<void> {
  const authStore = useAuthStore();

  if (!authStore.isLoggedIn || !authStore.token) {
    throw new Error(
      "Du musst eingeloggt sein, um ein Buch zu übernehmen."
    );
  }

  const mutation = `
    mutation OeffentlichesBuchUebernehmen(
      $openLibraryKey: String!
      $titel: String!
      $autorName: String!
      $coverBild: String
      $erscheinungsjahr: Int
    ) {
      oeffentlichesBuchUebernehmen(
        openLibraryKey: $openLibraryKey
        titel: $titel
        autorName: $autorName
        coverBild: $coverBild
        erscheinungsjahr: $erscheinungsjahr
      ) {
        _id
        titel
        coverBild
        openLibraryKey
        erscheinungsjahr
        lookupAutor {
          _id
          name
          vorname
        }
      }
    }
  `;

  const antwort = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
      Authorization: `Bearer ${authStore.token}`,
    },
    body: JSON.stringify({
      query: mutation,
      variables: {
        openLibraryKey: buch.openLibraryKey,
        titel: buch.titel,
        autorName: buch.autorName,
        coverBild: buch.coverBild ?? null,
        erscheinungsjahr: buch.erscheinungsjahr ?? null,
      },
    }),
  });

  const daten = await antwort.json();

  if (daten.errors) {
    throw new Error(daten.errors[0].message);
  }

  const neuesBuch = daten.data.oeffentlichesBuchUebernehmen;

  this.buecher.push({
    ...neuesBuch,
    autor: neuesBuch.lookupAutor,
  });
},
    async sucheOeffentlicheBuecher(suchbegriff: string) {
  const bereinigterSuchbegriff = suchbegriff.trim();

  this.oeffentlicheBuecherFehler = "";

  if (bereinigterSuchbegriff.length < 2) {
    this.oeffentlicheBuecher = [];
    this.oeffentlicheBuecherFehler =
      "Bitte gib mindestens zwei Zeichen ein.";
    return;
  }

  this.oeffentlicheBuecherWerdenGeladen = true;

  try {
    const query = `
      query OeffentlicheBuecherSuchen($suchbegriff: String!) {
        oeffentlicheBuecherSuchen(suchbegriff: $suchbegriff) {
          openLibraryKey
          titel
          autorName
          erscheinungsjahr
          coverBild
        }
      }
    `;

    const antwort = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      body: JSON.stringify({
        query,
        variables: {
          suchbegriff: bereinigterSuchbegriff,
        },
      }),
    });

    if (!antwort.ok) {
      throw new Error(
        "Die Anfrage ist fehlgeschlagen. Status: " + antwort.status
      );
    }

    const daten = await antwort.json();

    if (daten.errors) {
      throw new Error(daten.errors[0].message);
    }

    this.oeffentlicheBuecher =
      daten.data?.oeffentlicheBuecherSuchen ?? [];

    if (this.oeffentlicheBuecher.length === 0) {
      this.oeffentlicheBuecherFehler =
        "Zu diesem Suchbegriff wurden keine Bücher gefunden.";
    }
  } catch (error: unknown) {
    console.error(
      "Fehler bei der Suche nach öffentlichen Büchern:",
      error
    );

    this.oeffentlicheBuecher = [];

    if (error instanceof Error) {
      this.oeffentlicheBuecherFehler = error.message;
    } else {
      this.oeffentlicheBuecherFehler =
        "Bei der Buchsuche ist ein unbekannter Fehler aufgetreten.";
    }
  } finally {
    this.oeffentlicheBuecherWerdenGeladen = false;
  }
},
    async ladeAlleBuecher (limit: number, offset: number, q?: string) {
      try {
        const query = `
          query($limit: Int, $offset: Int, $q: String) {
          alleBuecher(limit: $limit, offset: $offset, q: $q) {
           _id
           titel
           beschreibung
           coverBild
           durchschnittsBewertung
           anzahlBewertungen
           lookupAutor {
           _id
           name
           vorname
      }
    }
  }
`;

        const antwort = await fetch(GRAPHQL_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json;charset=utf-8" },

          body: JSON.stringify({
            query,
            variables: { limit, offset, q } }),
        });

        const daten = await antwort.json();

        this.buecher = (daten.data.alleBuecher || []).map((b: any) => ({
          ...b,
          autor: b.lookupAutor,
        }));
        console.log("Bücher erfolgreich geladen!");
      } catch (error) {
        console.error("Fehler beim Laden der Bücher", error);
        console.log("Lade Bücher für Seite", offset / limit + 1);
        this.buecher = [];
      }
    },


    async ladeBuecherAnzahl (q?: string) {
      try {
        const query = `
        query($q: String) {
        buecherAnzahl(q: $q)
      }
    `


        const antwort = await fetch(GRAPHQL_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, variables: { q } }),
        });

        const daten = await antwort.json();
        console.log("Rohdaten für Bücheranzahl:", daten);

        if (daten.errors) {
          throw new Error(daten.errors[0].message);
        }

        this.buecherGesamt = daten.data?.buecherAnzahl ?? 0;
        console.log("Gesamtanzahl Bücher gesetzt auf:", this.buecherGesamt);
      } catch (error) {
        console.error("Fehler beim Laden der Bücheranzahl:", error);
      }
    },

    async buchHinzufuegen (titel: string, autorId: string) {
      const authStore = useAuthStore();

      if (!authStore.isLoggedIn) {
        alert("Du musst eingeloggt sein, um das zu tun.");
        return;
      }
      if (!titel || !autorId) {
        alert("Bitte Titel und Autor eingeben.");
        return;
      }

      try {
        const mutation = `
          mutation($titel: String!, $autorId: ObjectId!) {
            buchHinzufuegen(titel: $titel, autorId: $autorId) {
              _id
              titel
              lookupAutor {
              _id
              name
              vorname
              }
            }
          }
        `;

        const headers = {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authStore.token}`,
        };

        const antwort = await fetch(GRAPHQL_ENDPOINT, {
          method: "POST",
          headers,
          body: JSON.stringify({
            query: mutation,
            variables: {
              titel,
              autorId,
            },
          }),
        });

        const daten = await antwort.json();
        if (daten.errors) {
          throw new Error(daten.errors[0].message);
        }

        const neuesBuchAusDB = daten.data.buchHinzufuegen;

        this.buecher.push(neuesBuchAusDB);
      } catch (error: unknown) {
        console.error("Fehler beim Speichern des Buches", error);
        if (error instanceof Error) {
  alert(`Fehler: ${error.message}`);
} else {
  alert("Ein unbekannter Fehler ist aufgetreten.");
}
      }
    },

    async buchLoeschen (id: string) {
      const authStore = useAuthStore();
      if (!authStore.isLoggedIn) {
        alert("Du musst eingeloggt sein.");
        return;
      }
      try {
        const mutation = `
          mutation($id: ObjectId!) {
            buchLoeschen(id: $id)
          }
        `;
        const headers = {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authStore.token}`,
        };

        const antwort = await fetch(GRAPHQL_ENDPOINT, {
          method: "POST",
          headers,
          body: JSON.stringify({
            query: mutation,
            variables: {
              id,
            },
          }),
        });
        const daten = await antwort.json();

        if (daten.errors) {
          throw new Error(daten.errors[0].message);
        }

        this.buecher = this.buecher.filter(buch => buch._id !== id);
      } catch (error) {
        console.error("Fehler beim Löschen des Buches via GraphQL:", error);
      }
    },

    async bewerteBuch (buchId: string, bewertung: number) {
      const authStore = useAuthStore();
      if (!authStore.isLoggedIn) {
        alert("Sie sind nicht eingeloggt");
        return;
      }
      const mutation = `
        mutation BewerteBuch($buchId: ObjectId!, $bewertung: Int!) {
          bewerteBuch(buchId: $buchId, bewertung: $bewertung) {
            _id
            durchschnittsBewertung
            anzahlBewertungen
          }
        }
      `;

      try {
        const headers = {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authStore.token}`,
        };

        const antwort = await fetch(GRAPHQL_ENDPOINT, {
          method: "POST",
          headers,
          body: JSON.stringify({
            query: mutation,
            variables: { buchId, bewertung },
          }),
        });

        const daten = await antwort.json();
        if (daten.errors) {
          throw new Error(daten.errors[0].message);
        }

        const aktualisiertesBuch = daten.data.bewerteBuch;
        if (aktualisiertesBuch) {
          const index = this.buecher.findIndex((b: IBuch) => b._id === buchId);
          if (index !== -1) {
            this.buecher[index] = {
              ...this.buecher[index],
              ...aktualisiertesBuch,
            };
          }
        }
      } catch (error: any) {
        console.error("Fehler beim Bewerten des Buches:", error);
        alert(`Fehler: ${error.message}`);
      }
    },
  },
});
