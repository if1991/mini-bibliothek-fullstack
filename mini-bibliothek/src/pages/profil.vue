```vue
<template>
  <main class="profil-seite">
    <section class="profil-kopf">
      <p class="profil-kicker">
        Persönlicher Bereich
      </p>

      <h1>Mein Profil</h1>

      <p>
        Hier findest du deine Kontodaten und deine gespeicherten Bücher.
      </p>
    </section>

    <section class="profil-inhalt">
      <v-card class="profil-karte" elevation="0">
        <div class="profil-oben">
          <v-avatar
            class="profil-avatar"
            size="88"
          >
            {{ initialen }}
          </v-avatar>

          <div class="profil-identitaet">
            <h2>{{ vollstaendigerName }}</h2>

            <p>{{ email }}</p>

            <v-chip
              size="small"
              class="rollen-chip"
              prepend-icon="mdi-account-outline"
            >
              {{ rollenBezeichnung }}
            </v-chip>
          </div>
        </div>

        <v-divider />

        <div class="profil-informationen">
          <div class="profil-info">
            <v-icon>
              mdi-account-outline
            </v-icon>

            <div>
              <span>Name</span>
              <strong>{{ vollstaendigerName }}</strong>
            </div>
          </div>

          <div class="profil-info">
            <v-icon>
              mdi-email-outline
            </v-icon>

            <div>
              <span>E-Mail-Adresse</span>
              <strong>{{ email }}</strong>
            </div>
          </div>

          <div class="profil-info">
            <v-icon>
              mdi-heart-outline
            </v-icon>

            <div>
              <span>Gespeicherte Favoriten</span>
              <strong>
                {{ anzahlFavoriten }}
                {{ anzahlFavoriten === 1 ? "Buch" : "Bücher" }}
              </strong>
            </div>
          </div>
        </div>

        <div class="profil-aktionen">
          <v-btn
            to="/meine-buecher"
            prepend-icon="mdi-heart-outline"
            class="favoriten-button"
          >
            Favoriten ansehen
          </v-btn>

          <v-btn
            to="/bibliothek"
            prepend-icon="mdi-bookshelf"
            variant="outlined"
            class="bibliothek-button"
          >
            Zur Bibliothek
          </v-btn>
        </div>
      </v-card>
    </section>
  </main>
</template>

<route lang="yaml">
name: profil
path: /profil
meta:
  requiresAuth: true
</route>

<script setup lang="ts">
import { computed } from "vue";
import { useAuthStore } from "@/stores/authStore";

const authStore = useAuthStore();

const email = computed(() => {
  if (!authStore.user?.email) {
    return "—";
  }

  return authStore.user.email;
});

const vollstaendigerName = computed(() => {
  if (!authStore.user) {
    return "—";
  }

  const vorname = authStore.user.vorname ?? "";
  const nachname = authStore.user.name ?? "";
  const name = `${vorname} ${nachname}`.trim();

  if (!name) {
    return "—";
  }

  return name;
});

const initialen = computed(() => {
  if (!authStore.user) {
    return "?";
  }

  const vorname =
    authStore.user.vorname?.charAt(0) ?? "";

  const nachname =
    authStore.user.name?.charAt(0) ?? "";

  const ergebnis =
    `${vorname}${nachname}`.toUpperCase();

  if (!ergebnis) {
    return "?";
  }

  return ergebnis;
});

const rollenBezeichnung = computed(() => {
  if (authStore.user?.rolle === "ADMIN") {
    return "Administrator";
  }

  return "Nutzer";
});

const anzahlFavoriten = computed(() => {
  return authStore.user?.persoenlicheListe?.length ?? 0;
});
</script>

<style scoped>
.profil-seite {
  min-height: 100%;
  background: rgb(var(--v-theme-background));
  color: rgb(var(--v-theme-textPrimary));
}

.profil-kopf {
  padding: 56px clamp(24px, 6vw, 96px);
  background:
    radial-gradient(
      circle at 88% 20%,
      rgba(var(--v-theme-surface), 0.45),
      transparent 30%
    ),
    linear-gradient(
      135deg,
      rgb(var(--v-theme-heroStart)),
      rgb(var(--v-theme-heroEnd))
    );
}

.profil-kicker {
  margin-bottom: 10px;
  color: rgb(var(--v-theme-primary));
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.profil-kopf h1 {
  margin-bottom: 14px;
  color: rgb(var(--v-theme-textPrimary));
  font-size: clamp(2.6rem, 5vw, 4.5rem);
  line-height: 1;
  letter-spacing: -0.04em;
}

.profil-kopf > p:last-child {
  max-width: 620px;
  margin: 0;
  color: rgb(var(--v-theme-textMuted));
  line-height: 1.7;
}

.profil-inhalt {
  display: flex;
  justify-content: center;
  padding: 56px 24px 90px;
}

.profil-karte {
  width: 100%;
  max-width: 760px;
  overflow: hidden;
  border: 1px solid rgb(var(--v-theme-cardBorder));
  border-radius: 24px;
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-textPrimary));
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.12);
}

.profil-oben {
  display: flex;
  gap: 22px;
  align-items: center;
  padding: 32px;
}

.profil-avatar {
  flex: 0 0 auto;
  background: rgb(var(--v-theme-secondary));
  color: rgb(var(--v-theme-textPrimary));
  font-size: 1.65rem;
  font-weight: 900;
}

.profil-identitaet h2 {
  margin-bottom: 4px;
  color: rgb(var(--v-theme-textPrimary));
  font-size: 1.65rem;
}

.profil-identitaet p {
  margin-bottom: 12px;
  color: rgb(var(--v-theme-textMuted));
}

.rollen-chip {
  background: rgb(var(--v-theme-softSurface));
  color: rgb(var(--v-theme-textPrimary));
  font-weight: 700;
}

.profil-informationen {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  padding: 28px 32px;
}

.profil-info {
  display: flex;
  min-width: 0;
  gap: 12px;
  align-items: flex-start;
  padding: 18px;
  border: 1px solid rgb(var(--v-theme-cardBorder));
  border-radius: 16px;
  background: rgb(var(--v-theme-softSurface));
}

.profil-info .v-icon {
  color: rgb(var(--v-theme-primary));
}

.profil-info div {
  min-width: 0;
}

.profil-info span,
.profil-info strong {
  display: block;
}

.profil-info span {
  margin-bottom: 5px;
  color: rgb(var(--v-theme-textMuted));
  font-size: 0.76rem;
}

.profil-info strong {
  overflow: hidden;
  color: rgb(var(--v-theme-textPrimary));
  font-size: 0.9rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.profil-aktionen {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 4px 32px 32px;
}

.favoriten-button {
  border-radius: 13px;
  background: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
  font-weight: 800;
  text-transform: none;
}

.bibliothek-button {
  border-color: rgb(var(--v-theme-primary));
  border-radius: 13px;
  color: rgb(var(--v-theme-textPrimary));
  font-weight: 800;
  text-transform: none;
}

@media (max-width: 700px) {
  .profil-kopf {
    padding-right: 22px;
    padding-left: 22px;
  }

  .profil-oben {
    align-items: flex-start;
    flex-direction: column;
  }

  .profil-informationen {
    grid-template-columns: 1fr;
  }

  .profil-aktionen {
    flex-direction: column;
  }

  .profil-aktionen .v-btn {
    width: 100%;
  }
}
</style>
```
