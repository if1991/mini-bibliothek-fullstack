<template>
  <main class="favoriten-seite">
    <section class="favoriten-header">
      <div>
        <p class="favoriten-kicker">
          Persönliche Sammlung
        </p>

        <h1>Meine Favoriten</h1>

        <p>
          Hier findest du alle Bücher, die du für später gespeichert hast.
        </p>
      </div>

      <v-btn
        to="/bibliothek"
        prepend-icon="mdi-bookshelf"
        class="bibliothek-button"
      >
        Weitere Bücher entdecken
      </v-btn>
    </section>

    <section class="favoriten-inhalt">
      <template v-if="authStore.isLoggedIn && authStore.user">
        <div class="favoriten-toolbar">
          <div>
            <h2>Gespeicherte Bücher</h2>

            <p>
              {{ favoriten.length }}
              {{ favoriten.length === 1 ? "Favorit" : "Favoriten" }}
            </p>
          </div>
        </div>

        <div
          v-if="favoriten.length > 0"
          class="favoriten-grid"
        >
          <article
            v-for="buch in favoriten"
            :key="buch._id"
            class="favorit-karte"
          >
            <div class="cover-bereich">
              <img
                v-if="buch.coverBild"
                :src="buch.coverBild"
                :alt="'Cover von ' + buch.titel"
                class="buch-cover"
              >

              <div
                v-else
                class="cover-platzhalter"
              >
                <v-icon size="58">
                  mdi-book-open-page-variant-outline
                </v-icon>

                <span>Kein Cover vorhanden</span>
              </div>

              <v-btn
                icon="mdi-heart-off-outline"
                size="small"
                class="entfernen-icon"
                aria-label="Aus Favoriten entfernen"
                @click="handleFavoritEntfernen(buch._id)"
              />
            </div>

            <div class="favorit-inhalt">
              <p class="buch-autor">
                {{ autorNameErmitteln(buch) }}
              </p>

              <h2 class="buch-titel">
                {{ buch.titel }}
              </h2>

              <p
                v-if="buch.erscheinungsjahr"
                class="buch-jahr"
              >
                Erschienen {{ buch.erscheinungsjahr }}
              </p>

              <div class="bewertung">
                <v-icon
                  color="amber"
                  size="18"
                >
                  mdi-star
                </v-icon>

                <strong>
                  {{
                    bewertungFormatieren(
                      buch.durchschnittsBewertung
                    )
                  }}
                </strong>

                <span>
                  ({{ buch.anzahlBewertungen ?? 0 }})
                </span>
              </div>

              <v-btn
                block
                variant="outlined"
                prepend-icon="mdi-heart-remove-outline"
                class="entfernen-button"
                @click="handleFavoritEntfernen(buch._id)"
              >
                Aus Favoriten entfernen
              </v-btn>
            </div>
          </article>
        </div>

        <div
          v-else
          class="favoriten-leer"
        >
          <v-icon size="66">
            mdi-heart-outline
          </v-icon>

          <h2>Noch keine Favoriten</h2>

          <p>
            Speichere Bücher aus der Bibliothek, damit du sie hier
            schnell wiederfindest.
          </p>

          <v-btn
            to="/bibliothek"
            prepend-icon="mdi-bookshelf"
            class="bibliothek-button"
          >
            Bibliothek ansehen
          </v-btn>
        </div>
      </template>

      <div
        v-else
        class="favoriten-leer"
      >
        <v-icon size="66">
          mdi-account-lock-outline
        </v-icon>

        <h2>Anmeldung erforderlich</h2>

        <p>
          Melde dich an, um deine gespeicherten Favoriten anzusehen.
        </p>

        <v-btn
          to="/login"
          prepend-icon="mdi-login"
          class="bibliothek-button"
        >
          Jetzt anmelden
        </v-btn>
      </div>
    </section>
  </main>
</template>

<script lang="ts" setup>
import { computed, onMounted } from "vue";
import type { IBuch } from "@/types/models";
import { useAuthStore } from "@/stores/authStore";

const authStore = useAuthStore();

const favoriten = computed(() => {
  if (!authStore.user?.persoenlicheListe) {
    return [];
  }

  return authStore.user.persoenlicheListe;
});

function autorNameErmitteln(buch: IBuch): string {
  if (!buch.autor) {
    return "Unbekannter Autor";
  }

  const vorname = buch.autor.vorname ?? "";
  const nachname = buch.autor.name ?? "";
  const autorName = `${vorname} ${nachname}`.trim();

  if (!autorName) {
    return "Unbekannter Autor";
  }

  return autorName;
}

function bewertungFormatieren(
  bewertung: number | undefined
): string {
  if (!bewertung) {
    return "0,0";
  }

  return bewertung.toFixed(1).replace(".", ",");
}

async function handleFavoritEntfernen(
  buchId: string
): Promise<void> {
  const bestaetigt = confirm(
    "Möchtest du dieses Buch wirklich aus deinen Favoriten entfernen?"
  );

  if (!bestaetigt) {
    return;
  }

  await authStore.buchAusFavoritenEntfernen(buchId);
}

onMounted(async () => {
  if (authStore.isLoggedIn) {
    await authStore.fetchMe();
  }
});
</script>

<style scoped>
.favoriten-seite {
  min-height: 100%;
  background: rgb(var(--v-theme-background));
  color: rgb(var(--v-theme-textPrimary));
}

.favoriten-header {
  display: flex;
  justify-content: space-between;
  gap: 40px;
  align-items: flex-end;
  padding: 58px clamp(28px, 6vw, 100px);
  background:
    radial-gradient(
      circle at 90% 20%,
      rgba(var(--v-theme-surface), 0.45),
      transparent 30%
    ),
    linear-gradient(
      135deg,
      rgb(var(--v-theme-heroStart)),
      rgb(var(--v-theme-heroEnd))
    );
}

.favoriten-kicker {
  margin-bottom: 10px;
  color: rgb(var(--v-theme-primary));
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.favoriten-header h1 {
  margin-bottom: 14px;
  color: rgb(var(--v-theme-textPrimary));
  font-size: clamp(2.8rem, 5vw, 4.8rem);
  line-height: 1;
  letter-spacing: -0.045em;
}

.favoriten-header p:last-child {
  max-width: 640px;
  margin: 0;
  color: rgb(var(--v-theme-textMuted));
  line-height: 1.7;
}

.bibliothek-button {
  flex-shrink: 0;
  border-radius: 14px;
  background: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
  font-weight: 800;
  text-transform: none;
}

.favoriten-inhalt {
  min-height: 500px;
  padding: 56px clamp(28px, 6vw, 100px) 90px;
}

.favoriten-toolbar {
  margin-bottom: 30px;
}

.favoriten-toolbar h2 {
  margin-bottom: 5px;
  color: rgb(var(--v-theme-textPrimary));
  font-size: 2rem;
}

.favoriten-toolbar p {
  margin: 0;
  color: rgb(var(--v-theme-textMuted));
}

.favoriten-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 24px;
}

.favorit-karte {
  display: flex;
  overflow: hidden;
  flex-direction: column;
  border: 1px solid rgb(var(--v-theme-cardBorder));
  border-radius: 22px;
  background: rgb(var(--v-theme-surface));
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.11);
  transition:
    transform 180ms ease,
    box-shadow 180ms ease;
}

.favorit-karte:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.18);
}

.cover-bereich {
  position: relative;
  aspect-ratio: 4 / 5;
  overflow: hidden;
  background: rgb(var(--v-theme-softSurface));
}

.buch-cover {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-platzhalter {
  display: flex;
  height: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: rgb(var(--v-theme-textMuted));
}

.entfernen-icon {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(var(--v-theme-surface), 0.92);
  color: rgb(var(--v-theme-error));
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
}

.favorit-inhalt {
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 20px;
}

.buch-autor {
  margin-bottom: 8px;
  color: rgb(var(--v-theme-primary));
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.buch-titel {
  margin-bottom: 10px;
  color: rgb(var(--v-theme-textPrimary));
  font-size: 1.08rem;
  line-height: 1.35;
}

.buch-jahr {
  margin-bottom: 12px;
  color: rgb(var(--v-theme-textMuted));
  font-size: 0.86rem;
}

.bewertung {
  display: flex;
  gap: 6px;
  align-items: center;
  margin-top: auto;
  padding-top: 12px;
  color: rgb(var(--v-theme-textPrimary));
}

.bewertung span {
  color: rgb(var(--v-theme-textMuted));
  font-size: 0.82rem;
}

.entfernen-button {
  margin-top: 18px;
  border-color: rgb(var(--v-theme-cardBorder));
  border-radius: 12px;
  color: rgb(var(--v-theme-error));
  font-weight: 700;
  text-transform: none;
}

.favoriten-leer {
  display: flex;
  min-height: 350px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 24px;
  border: 1px dashed rgb(var(--v-theme-cardBorder));
  border-radius: 22px;
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-textMuted));
  text-align: center;
}

.favoriten-leer h2 {
  margin: 18px 0 8px;
  color: rgb(var(--v-theme-textPrimary));
}

.favoriten-leer p {
  max-width: 540px;
  margin: 0 0 24px;
  line-height: 1.65;
}

@media (max-width: 1200px) {
  .favoriten-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 850px) {
  .favoriten-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .bibliothek-button {
    width: 100%;
  }

  .favoriten-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .favoriten-header,
  .favoriten-inhalt {
    padding-right: 22px;
    padding-left: 22px;
  }

  .favoriten-grid {
    grid-template-columns: 1fr;
  }
}
</style>
