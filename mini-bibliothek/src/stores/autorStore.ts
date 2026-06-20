import type { IAutor } from '@/types/models';
import { defineStore } from "pinia";

interface IAutorState {
  autoren: IAutor[]
}


const GRAPHQL_ENDPOINT =
  import.meta.env.VITE_GRAPHQL_ENDPOINT ||
  "http://localhost:4000/graphql";



export const useAutorStore = defineStore("autor", {
  state: (): IAutorState => ({
    autoren: [],
  }),

  getters: {
    anzahlAutoren: state => state.autoren.length,
  },
  actions: {
    async ladeAlleAutoren() {
      console.log("1. Aktion 'ladeAlleAutoren' gestartet.");

      try {
        const query = `
  query {
    alleAutoren {
      _id
      name
      vorname
      buecher {
        _id
      }
    }
  }
`;
        console.log("2. Query wird abgeschickt:", query);

        const antwort = await fetch(GRAPHQL_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        });
        console.log("3. Antwort vom Server erhalten:", antwort.status, antwort.statusText);

        if (!antwort.ok) {
          throw new Error(`Server antwortete mit Status ${antwort.status}`);
        }

        const daten = await antwort.json();
        console.log("4. Daten als JSON verarbeitet:", daten);

        if (daten.errors) {
          console.error("5a. GraphQL-Fehler gefunden:", daten.errors);
          throw new Error(daten.errors[0].message);
        }

        if (daten.data && daten.data.alleAutoren) {
          this.autoren = daten.data.alleAutoren;
          console.log("5b. Erfolgreich! Autoren im Store gesetzt:", this.autoren);
        } else {
          console.warn("5c. Keine Daten oder 'alleAutoren'-Feld in der Antwort gefunden.");
          this.autoren = [];
        }
      } catch (error) {
        console.error("6. FEHLER im catch-Block:", error);
        this.autoren = [];
      }
    },

    async gibEinAutorUndSeineBuecher (autorId: string): Promise<IAutor | null> {
      try {
        const query = `
          query GibEinAutorQuery($id: ObjectId!) {
            gibEinAutor(id: $id) {
              _id
              name
              vorname
              geburtsdatum
              land
              buecher {
                _id
                titel
                durchschnittsBewertung
                anzahlBewertungen
              }
            }
          }
        `;

        const antwort = await fetch(GRAPHQL_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query, variables: { id: autorId } }),
        });

        const daten = await antwort.json();
        if (daten.errors) {
          throw new Error(daten.errors[0].message);
        }

        console.log("Einzelner Autor geladen:", daten.data.gibEinAutor);
        return daten.data.gibEinAutor;
      } catch (error) {
        console.error("Fehler beim Laden des einzelnen Autors aufgetreten!", error);
        return null;
      }
    },
  },
});