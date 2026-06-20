import type { IBuch, IUser } from "@/types/models";
import { defineStore } from "pinia";


const GRAPHQL_ENDPOINT =
  import.meta.env.VITE_GRAPHQL_ENDPOINT ||
  "http://localhost:4000/graphql";


export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: localStorage.getItem("authToken") || null,
    user: null as IUser | null,
  }),

  getters: {
      isLoggedIn: state => !!state.token,

  isAdmin: state => {
    return state.user?.rolle === "ADMIN";
  },

  userName: state => {
    if (!state.user) {
      return "";
    }

    return `${state.user.vorname} ${state.user.name}`;
  },
},

  actions: {
    async registrieren(
      name: string,
      vorname: string,
      email: string,
      password: string
    ) {
      const mutation = `
        mutation($name: String!, $vorname: String!, $email: String!, $password: String!) {
          registrieren(name: $name, vorname: $vorname, email: $email, password: $password) {
            _id
            email
            rolle
          }
        }
      `;
      try {
        const antwort = await fetch(GRAPHQL_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json;charset=utf-8" },
          body: JSON.stringify({
            query: mutation,
            variables: { name, vorname, email, password },
          }),
        });

        const daten = await antwort.json();
        if (daten.errors) throw new Error(daten.errors[0].message);
        console.log("Registrierung erfolgreich. Bitte jetzt einloggen.");
      } catch (error) {
        console.error("Fehler bei der Registrierung:", error);
        throw error;
      }
    },

async einloggen(email: string, password: string) {
  const mutation = `
    mutation($email: String!, $password: String!) {
      einloggen(email: $email, password: $password) {
        token
        user {
          _id
          name
          vorname
          email
        }
      }
    }
  `;
      try {
        const antwort = await fetch(GRAPHQL_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json;charset=utf-8" },
          body: JSON.stringify({
            query: mutation,
            variables: { email, password },
          }),
        });

        const daten = await antwort.json();
        if (daten.errors) throw new Error(daten.errors[0].message);

        if (daten.data?.einloggen) {
          const user = daten.data.einloggen.user;

          const mappedUser = {
  ...user,
  persoenlicheListe: [],
};

this.token = daten.data.einloggen.token;
this.user = mappedUser;

if (this.token) {
  localStorage.setItem("authToken", this.token);
  await this.fetchMe();
}
        }
      } catch (error: any) {
        console.error("Login-Fehler:", error);
        this.logout();
        throw error;
      }
    },

    async buchZuFavoritenHinzufuegen(buchId: string) {
      if (!this.token) {
        return console.error("Nicht eingeloggt.");
      }

      const mutation = `
        mutation($buchId: ObjectId!) {
          buchZuFavoritenHinzufuegen(buchId: $buchId) {
           user {
            persoenlicheListe {
            _id
            titel
            lookupAutor {
            name
            vorname
              }
              }
            }
          }
        }
      `;

      try {
        const antwort = await fetch(GRAPHQL_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json;charset=utf-8",
            Authorization: `Bearer ${this.token}`,
          },
          body: JSON.stringify({ query: mutation, variables: { buchId } }),
        });

        const daten = await antwort.json();
        if (daten.errors) {
          throw new Error(daten.errors[0].message);
        }

        if (daten.data?.buchZuFavoritenHinzufuegen?.user && this.user) {
  this.user.persoenlicheListe =
    (
      daten.data.buchZuFavoritenHinzufuegen.user.persoenlicheListe ?? []
    ).map((buch: any) => ({
      ...buch,
      autor: buch.lookupAutor,
    }));
}
      } catch (error: any) {
        console.error("Fehler beim Hinzufügen zu den Favoriten:", error);
        alert(error.message);
      }
    },

    async buchAusFavoritenEntfernen(buchId: string) {
      if (!this.token) return console.error("Nicht eingeloggt.");

      const mutation = `
  mutation($buchId: ObjectId!) {
    buchAusFavoritenEntfernen(buchId: $buchId) {
      message
    }
  }
`;

      try {
        const antwort = await fetch(GRAPHQL_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json;charset=utf-8",
            Authorization: `Bearer ${this.token}`,
          },
          body: JSON.stringify({ query: mutation, variables: { buchId } }),
        });

        const daten = await antwort.json();
        if (daten.errors) throw new Error(daten.errors[0].message);

        if (daten.data?.buchAusFavoritenEntfernen) {
          await this.fetchMe();
        }
      } catch (error: any) {
        console.error("Fehler beim Entfernen aus den Favoriten:", error);
        alert(error.message);
      }
    },

    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem("authToken");
      console.log("Erfolgreich ausgeloggt.");
    },

    async fetchMe() {
      if (!this.token) return;

      const query = `
        query {
          meMitLookups {
            _id
            name
            vorname
            email
            rolle
            persoenlicheListe {
              _id
              titel
              lookupAutor {
                name
                vorname
              }
            }
          }
        }
      `;

      try {
        const antwort = await fetch(GRAPHQL_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json;charset=utf-8",
            Authorization: `Bearer ${this.token}`,
          },
          body: JSON.stringify({ query }),
        });

        const daten = await antwort.json();
        if (daten.data?.meMitLookups) {
          const user = daten.data.meMitLookups;

          this.user = {
  ...user,
  persoenlicheListe: (user.persoenlicheListe ?? []).map((buch: any) => ({
    ...buch,
    autor: buch.lookupAutor,
  })),
};
        } else {
          this.logout();
        }
      } catch (error) {
        console.error("Fehler beim Holen der 'me'-Daten:", error);
        this.logout();
      }
    },
  },
});
