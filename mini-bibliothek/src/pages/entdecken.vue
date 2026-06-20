<template>
  <main class="entdecken-seite">
    <section class="entdecken-header">
      <div>
        <p class="entdecken-kicker">
          Open Library
        </p>

        <h1 class="entdecken-title">
          Bücher entdecken
        </h1>

        <p class="entdecken-text">
          Suche nach Titeln oder Autoren in einer öffentlichen
          Bibliothek und übernimm ausgewählte Bücher in unsere Sammlung.
        </p>
      </div>

      <v-btn
        to="/bibliothek"
        variant="outlined"
        class="bibliothek-button"
        prepend-icon="mdi-bookshelf"
      >
        Zur Bibliothek
      </v-btn>
    </section>

    <section class="entdecken-inhalt">
      <div class="entdecken-suche">
        <v-text-field
          v-model="suchbegriff"
          label="Titel oder Autor suchen"
          placeholder="Zum Beispiel: Douglas Adams"
          variant="outlined"
          clearable
          hide-details
          prepend-inner-icon="mdi-magnify"
          @keyup.enter="sucheStarten"
          @click:clear="sucheZuruecksetzen"
        />

        <v-btn
          class="entdecken-button"
          size="large"
          :loading="buchStore.oeffentlicheBuecherWerdenGeladen"
          @click="sucheStarten"
        >
          Suchen
        </v-btn>
      </div>

      <div
        v-if="buchStore.oeffentlicheBuecherFehler"
        class="entdecken-fehler"
      >
        {{ buchStore.oeffentlicheBuecherFehler }}
      </div>

      <div
        v-if="buchStore.oeffentlicheBuecherWerdenGeladen"
        class="entdecken-laden"
      >
        <v-progress-circular
          indeterminate
          size="46"
        />

        <p>Open Library wird durchsucht …</p>
      </div>

      <template
        v-else-if="buchStore.oeffentlicheBuecher.length > 0"
      >
        <div class="ergebnis-kopf">
          <div>
            <p class="ergebnis-kicker">
              Suchergebnisse
            </p>

            <h2>
              Gefundene Bücher
            </h2>
          </div>

          <span>
            {{ buchStore.oeffentlicheBuecher.length }}
            Ergebnisse
          </span>
        </div>

        <div class="entdecken-grid">
          <article
            v-for="buch in buchStore.oeffentlicheBuecher"
            :key="buch.openLibraryKey"
            class="entdecken-card"
          >
            <div class="entdecken-cover-wrapper">
              <img
                v-if="buch.coverBild"
                :src="buch.coverBild"
                :alt="'Cover von ' + buch.titel"
                class="entdecken-cover"
              >

              <div
                v-else
                class="entdecken-cover-placeholder"
              >
                <v-icon size="54">
                  mdi-book-open-page-variant-outline
                </v-icon>

                <span>Kein Cover vorhanden</span>
              </div>

              <div
                v-if="istBereitsUebernommen(buch.openLibraryKey)"
                class="uebernommen-chip"
              >
                <v-icon size="16">
                  mdi-check
                </v-icon>

                Übernommen
              </div>
            </div>

            <div class="entdecken-card-content">
              <p class="entdecken-autor">
                {{ buch.autorName }}
              </p>

              <h2 class="entdecken-buch-title">
                {{ buch.titel }}
              </h2>

              <p
                v-if="buch.erscheinungsjahr"
                class="entdecken-jahr"
              >
                Erstmals veröffentlicht:
                {{ buch.erscheinungsjahr }}
              </p>

              <p
                v-else
                class="entdecken-jahr"
              >
                Erscheinungsjahr unbekannt
              </p>
<div class="entdecken-aktionen">
  <!-- Administrator darf Bücher übernehmen -->
  <v-btn
    v-if="authStore.isAdmin"
    block
    class="uebernehmen-button"
    :class="{
      'uebernehmen-button--erledigt':
        istBereitsUebernommen(buch.openLibraryKey)
    }"
    :loading="wirdUebernommen(buch.openLibraryKey)"
    :disabled="istBereitsUebernommen(buch.openLibraryKey)"
    :prepend-icon="
      istBereitsUebernommen(buch.openLibraryKey)
        ? 'mdi-check'
        : 'mdi-library-plus'
    "
    @click="buchUebernehmen(buch)"
  >
    {{
      istBereitsUebernommen(buch.openLibraryKey)
        ? "Bereits übernommen"
        : "In Bibliothek übernehmen"
    }}
  </v-btn>

  <!-- Eingeloggter normaler Nutzer darf nur suchen -->
  <v-btn
    v-else-if="authStore.isLoggedIn"
    block
    disabled
    variant="outlined"
    class="anmelden-button"
    prepend-icon="mdi-shield-lock-outline"
  >
    Nur durch Admin übernehmbar
  </v-btn>

  <!-- Gast wird zum Login geschickt -->
  <v-btn
    v-else
    block
    to="/login"
    variant="outlined"
    class="anmelden-button"
    prepend-icon="mdi-login"
  >
    Anmelden
  </v-btn>
</div>

            </div>
          </article>
        </div>
      </template>

      <div
        v-else
        class="entdecken-hinweis"
      >
        <v-icon size="56">
          mdi-book-search-outline
        </v-icon>

        <h2>Was möchtest du lesen?</h2>

        <p>
          Suche nach einem Buchtitel oder dem Namen eines Autors.
        </p>
      </div>
    </section>
  </main>
</template>

<script lang="ts" setup>
import { inject, ref, watch} from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import {
  useBuchStore,
  type IOeffentlichesBuch,
} from "@/stores/buchStore";

const buchStore = useBuchStore();
const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();

const toast = inject("toast") as any;

const suchbegriff = ref("");
const uebernommeneBuecher = ref<string[]>([]);
const aktuellInUebernahme = ref<string[]>([]);

function zeigeNachricht(
  nachricht: string,
  dauer: number = 4000
): void {
  if (toast?.value?.showToast) {
    toast.value.showToast(nachricht, dauer);
    return;
  }

  console.log(nachricht);
}

async function sucheStarten(): Promise<void> {
  const bereinigterSuchbegriff =
    suchbegriff.value.trim();

  if (bereinigterSuchbegriff.length < 2) {
    await buchStore.sucheOeffentlicheBuecher(
      bereinigterSuchbegriff
    );
    return;
  }

  const aktuellerQueryWert = route.query.q;

  if (
    typeof aktuellerQueryWert === "string" &&
    aktuellerQueryWert === bereinigterSuchbegriff
  ) {
    await buchStore.sucheOeffentlicheBuecher(
      bereinigterSuchbegriff
    );
    return;
  }

  await router.replace({
    path: "/entdecken",
    query: {
      q: bereinigterSuchbegriff,
    },
  });
}
watch(
  () => route.query.q,
  async neuerSuchbegriff => {
    if (typeof neuerSuchbegriff !== "string") {
      return;
    }

    const bereinigterSuchbegriff =
      neuerSuchbegriff.trim();

    if (bereinigterSuchbegriff.length < 2) {
      return;
    }

    suchbegriff.value = bereinigterSuchbegriff;

    await buchStore.sucheOeffentlicheBuecher(
      bereinigterSuchbegriff
    );
  },
  {
    immediate: true,
  }
);

async function sucheZuruecksetzen(): Promise<void> {
  suchbegriff.value = "";
  buchStore.oeffentlicheBuecher = [];
  buchStore.oeffentlicheBuecherFehler = "";

  await router.replace({
    path: "/entdecken",
  });
}

function wirdUebernommen(
  openLibraryKey: string
): boolean {
  return aktuellInUebernahme.value.includes(
    openLibraryKey
  );
}

function istBereitsUebernommen(
  openLibraryKey: string
): boolean {
  return uebernommeneBuecher.value.includes(
    openLibraryKey
  );
}

function alsUebernommenMarkieren(
  openLibraryKey: string
): void {
  if (
    uebernommeneBuecher.value.includes(
      openLibraryKey
    )
  ) {
    return;
  }

  uebernommeneBuecher.value.push(openLibraryKey);
}

async function buchUebernehmen(
  buch: IOeffentlichesBuch
): Promise<void> {
  if (!authStore.isLoggedIn) {
    zeigeNachricht(
      "Bitte melde dich an, um ein Buch zu übernehmen."
    );
    return;
  }

  if (
    istBereitsUebernommen(buch.openLibraryKey) ||
    wirdUebernommen(buch.openLibraryKey)
  ) {
    return;
  }

  aktuellInUebernahme.value.push(
    buch.openLibraryKey
  );

  try {
    await buchStore.oeffentlichesBuchUebernehmen(
      buch
    );

    alsUebernommenMarkieren(
      buch.openLibraryKey
    );

    await buchStore.ladeBuecherAnzahl();

    zeigeNachricht(
      `📚 „${buch.titel}“ wurde zur Bibliothek hinzugefügt.`
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      const nachricht = error.message;

      if (
        nachricht
          .toLowerCase()
          .includes("bereits")
      ) {
        alsUebernommenMarkieren(
          buch.openLibraryKey
        );
      }

      zeigeNachricht(nachricht);
    } else {
      zeigeNachricht(
        "Das Buch konnte nicht übernommen werden."
      );
    }
  } finally {
    aktuellInUebernahme.value =
      aktuellInUebernahme.value.filter(
        openLibraryKey =>
          openLibraryKey !== buch.openLibraryKey
      );
  }
}
</script>

<style scoped>
.entdecken-seite {
  min-height: 100%;
  background: #f4f0ee;
  color: #3f3531;
}

.entdecken-header {
  display: flex;
  justify-content: space-between;
  gap: 40px;
  align-items: flex-end;
  padding: 58px clamp(28px, 6vw, 100px);
  background:
    radial-gradient(
      circle at 90% 20%,
      rgba(255, 255, 255, 0.55),
      transparent 30%
    ),
    linear-gradient(
      135deg,
      #e8ddd7 0%,
      #d3bbb0 100%
    );
}

.entdecken-kicker,
.ergebnis-kicker {
  margin-bottom: 10px;
  color: #8c6f63;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.entdecken-title {
  margin-bottom: 14px;
  color: #3d302b;
  font-size: clamp(2.8rem, 5vw, 4.8rem);
  line-height: 1;
  letter-spacing: -0.045em;
}

.entdecken-text {
  max-width: 660px;
  margin: 0;
  color: #695750;
  font-size: 1.02rem;
  line-height: 1.7;
}

.bibliothek-button {
  flex-shrink: 0;
  border-color: #80685f;
  border-radius: 14px;
  color: #55443e;
  font-weight: 800;
  text-transform: none;
}

.entdecken-inhalt {
  padding: 48px clamp(28px, 6vw, 100px) 90px;
}

.entdecken-suche {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 16px;
  align-items: center;
  margin-bottom: 34px;
}

.entdecken-button {
  min-height: 56px;
  padding-inline: 30px;
  border-radius: 15px;
  background: #a98f84;
  color: #ffffff;
  font-weight: 800;
  text-transform: none;
}

.entdecken-fehler {
  margin-bottom: 26px;
  padding: 16px 18px;
  border: 1px solid #eadbd3;
  border-radius: 16px;
  background: #fff8f5;
  color: #775d53;
}

.entdecken-laden {
  display: flex;
  min-height: 320px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: #786a63;
}

.ergebnis-kopf {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  align-items: flex-end;
  margin-bottom: 28px;
}

.ergebnis-kopf h2 {
  color: #3f3531;
  font-size: 2rem;
}

.ergebnis-kopf > span {
  color: #897a73;
  font-size: 0.9rem;
}

.entdecken-grid {
  display: grid;
  grid-template-columns:
    repeat(4, minmax(0, 1fr));
  gap: 24px;
}

.entdecken-card {
  display: flex;
  overflow: hidden;
  flex-direction: column;
  border: 1px solid #eadfd9;
  border-radius: 22px;
  background: #ffffff;
  box-shadow:
    0 12px 30px rgba(87, 65, 56, 0.08);
  transition:
    transform 180ms ease,
    box-shadow 180ms ease;
}

.entdecken-card:hover {
  transform: translateY(-4px);
  box-shadow:
    0 18px 38px rgba(87, 65, 56, 0.13);
}

.entdecken-cover-wrapper {
  position: relative;
  aspect-ratio: 4 / 5;
  overflow: hidden;
  background: #f4ece8;
}

.entdecken-cover {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 220ms ease;
}

.entdecken-card:hover .entdecken-cover {
  transform: scale(1.025);
}

.entdecken-cover-placeholder {
  display: flex;
  height: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 20px;
  color: #9f8f87;
  font-weight: 700;
  text-align: center;
}

.uebernommen-chip {
  position: absolute;
  top: 14px;
  right: 14px;
  display: flex;
  gap: 5px;
  align-items: center;
  padding: 8px 11px;
  border-radius: 999px;
  background: rgba(88, 117, 91, 0.94);
  color: #ffffff;
  font-size: 0.76rem;
  font-weight: 800;
  box-shadow:
    0 6px 18px rgba(47, 69, 50, 0.2);
}

.entdecken-card-content {
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 20px;
}

.entdecken-autor {
  margin-bottom: 8px;
  color: #9b7e72;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.entdecken-buch-title {
  margin-bottom: 10px;
  color: #3f3531;
  font-size: 1.08rem;
  line-height: 1.35;
}

.entdecken-jahr {
  margin: 0;
  color: #9c8d86;
  font-size: 0.88rem;
  line-height: 1.5;
}

.entdecken-aktionen {
  margin-top: auto;
  padding-top: 20px;
}

.uebernehmen-button {
  min-height: 44px;
  border-radius: 12px;
  background: #a98f84;
  color: #ffffff;
  font-weight: 800;
  text-transform: none;
}

.uebernehmen-button--erledigt {
  background: #718574;
}

.anmelden-button {
  min-height: 44px;
  border-color: #b99f94;
  border-radius: 12px;
  color: #765f56;
  font-weight: 700;
  text-transform: none;
}

.entdecken-hinweis {
  display: flex;
  min-height: 320px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 24px;
  border: 1px dashed #d7c8c1;
  border-radius: 22px;
  background: #ffffff;
  color: #7b6c65;
  text-align: center;
}

.entdecken-hinweis h2 {
  margin: 16px 0 8px;
  color: #493a34;
}

.entdecken-hinweis p {
  margin: 0;
}

@media (max-width: 1150px) {
  .entdecken-grid {
    grid-template-columns:
      repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 820px) {
  .entdecken-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .bibliothek-button {
    width: 100%;
  }

  .entdecken-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .entdecken-header,
  .entdecken-inhalt {
    padding-right: 22px;
    padding-left: 22px;
  }

  .entdecken-suche {
    grid-template-columns: 1fr;
  }

  .entdecken-button {
    width: 100%;
  }

  .ergebnis-kopf {
    align-items: flex-start;
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .entdecken-grid {
    grid-template-columns: 1fr;
  }
}
</style>
```
