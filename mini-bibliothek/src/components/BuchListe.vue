<template>
  <section class="buchliste">
    <div
      v-if="list.length === 0"
      class="buchliste-leer"
    >
      <span>📚</span>
      <h2>Keine Bücher gefunden</h2>
      <p>In deiner Bibliothek befinden sich momentan keine Bücher.</p>
    </div>

    <div
      v-else
      class="buecher-grid"
    >
      <article
        v-for="buch in list"
        :key="buch._id ?? buch.id ?? buch.titel"
        class="buch-karte"
        tabindex="0"
        @click="oeffneBuchDialog(buch)"
        @keydown.enter="oeffneBuchDialog(buch)"
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

          <div class="karten-aktionen">
            <v-btn
              v-if="authStore.isLoggedIn"
              icon="mdi-heart-plus-outline"
              size="small"
              class="aktion-button"
              aria-label="Zu Favoriten hinzufügen"
              @click.stop="handleFavoritHinzufuegen(buch._id)"
            />

            <v-btn
              v-if="authStore.isAdmin"
              icon="mdi-delete-outline"
              size="small"
              class="aktion-button loeschen-button"
              aria-label="Buch löschen"
              @click.stop="loescheBuch(buch._id)"
            />
          </div>
        </div>

        <div class="buch-inhalt">
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

          <div
            class="bewertung-bereich"
            @click.stop
          >
            <v-rating
              color="amber"
              density="compact"
              hover
              :model-value="buch.durchschnittsBewertung ?? 0"
              :readonly="!authStore.isLoggedIn"
              size="small"
              @update:model-value="
                neuerWert => handleBewertung(buch._id, neuerWert)
              "
            />

            <span class="bewertung-zahl">
              {{ bewertungFormatieren(buch.durchschnittsBewertung) }}
            </span>

            <span class="bewertung-anzahl">
              ({{ buch.anzahlBewertungen ?? 0 }})
            </span>
          </div>

          <button
            type="button"
            class="details-button"
            @click.stop="oeffneBuchDialog(buch)"
          >
            Details ansehen
            <span>→</span>
          </button>
        </div>
      </article>
    </div>

    <v-dialog
      v-model="dialogIstOffen"
      max-width="850"
    >
      <v-card
        v-if="ausgewaehltesBuch"
        class="buch-dialog"
      >
        <v-btn
          icon="mdi-close"
          variant="text"
          class="dialog-schliessen"
          aria-label="Dialog schließen"
          @click="dialogIstOffen = false"
        />

        <div class="dialog-layout">
          <div class="dialog-cover-bereich">
            <img
              v-if="ausgewaehltesBuch.coverBild"
              :src="ausgewaehltesBuch.coverBild"
              :alt="'Cover von ' + ausgewaehltesBuch.titel"
              class="dialog-cover"
            >

            <div
              v-else
              class="dialog-cover-platzhalter"
            >
              <v-icon size="70">
                mdi-book-open-page-variant-outline
              </v-icon>

              <span>Kein Cover vorhanden</span>
            </div>
          </div>

          <div class="dialog-inhalt">
            <p class="dialog-kicker">
              Buchdetails
            </p>

            <h2 class="dialog-titel">
              {{ ausgewaehltesBuch.titel }}
            </h2>

            <p class="dialog-autor">
              von {{ autorNameErmitteln(ausgewaehltesBuch) }}
            </p>

            <p
              v-if="ausgewaehltesBuch.erscheinungsjahr"
              class="dialog-jahr"
            >
              Erstmals erschienen:
              {{ ausgewaehltesBuch.erscheinungsjahr }}
            </p>

            <p class="dialog-beschreibung">
              {{
                ausgewaehltesBuch.beschreibung ||
                  "Für dieses Buch ist momentan noch keine Beschreibung vorhanden."
              }}
            </p>

            <div class="dialog-bewertung">
              <v-rating
                color="amber"
                density="comfortable"
                hover
                :model-value="
                  ausgewaehltesBuch.durchschnittsBewertung ?? 0
                "
                :readonly="!authStore.isLoggedIn"
                @update:model-value="
                  neuerWert =>
                    handleBewertung(
                      ausgewaehltesBuch._id,
                      neuerWert
                    )
                "
              />

              <span>
                {{
                  bewertungFormatieren(
                    ausgewaehltesBuch.durchschnittsBewertung
                  )
                }}
                aus
                {{ ausgewaehltesBuch.anzahlBewertungen ?? 0 }}
                Bewertungen
              </span>
            </div>

            <div class="dialog-aktionen">
              <v-btn
  v-if="authStore.isLoggedIn"
  prepend-icon="mdi-heart-outline"
  class="favorit-button"
  @click="
    handleFavoritHinzufuegen(ausgewaehltesBuch._id)
  "
>
  Zu Favoriten
</v-btn>

              <v-btn
                v-else
                to="/login"
                variant="outlined"
                class="login-button"
                @click="dialogIstOffen = false"
              >
                Anmelden, um Favoriten zu speichern
              </v-btn>

              <v-btn
                variant="text"
                @click="dialogIstOffen = false"
              >
                Schließen
              </v-btn>
            </div>
          </div>
        </div>
      </v-card>
    </v-dialog>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useAuthStore } from "@/stores/authStore";
import { useBuchStore } from "@/stores/buchStore";

const buchStore = useBuchStore();
const authStore = useAuthStore();

const props = defineProps<{
  books?: any[];
}>();

const ausgewaehltesBuch = ref<any | null>(null);
const dialogIstOffen = ref(false);

const list = computed(() => {
  if (props.books && Array.isArray(props.books)) {
    return props.books;
  }

  if (Array.isArray(buchStore.buecher)) {
    return buchStore.buecher;
  }

  return [];
});

function autorNameErmitteln(buch: any): string {
  if (!buch || !buch.autor) {
    return "Unbekannter Autor";
  }

  const vorname = buch.autor.vorname ?? "";
  const name = buch.autor.name ?? "";
  const autorName = (vorname + " " + name).trim();

  if (autorName.length === 0) {
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

function oeffneBuchDialog(buch: any): void {
  ausgewaehltesBuch.value = buch;
  dialogIstOffen.value = true;
}

function loescheBuch(buchId: string): void {
  if (confirm("Möchtest du dieses Buch wirklich löschen?")) {
    buchStore.buchLoeschen(buchId);
  }
}

function handleBewertung(
  buchId: string,
  neuerWert: string | number | null
): void {
  if (neuerWert === null) {
    return;
  }

  const bewertung = Number(neuerWert);

  if (Number.isNaN(bewertung)) {
    return;
  }

  buchStore.bewerteBuch(buchId, bewertung);

  if (
    ausgewaehltesBuch.value &&
    ausgewaehltesBuch.value._id === buchId
  ) {
    ausgewaehltesBuch.value.durchschnittsBewertung =
      bewertung;
  }
}

function handleFavoritHinzufuegen(
  buchId: string
): void {
  authStore.buchZuFavoritenHinzufuegen(buchId);
}
</script>

<style scoped>
.buchliste {
  width: 100%;
}

.buecher-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 24px;
}

.buch-karte {
  overflow: hidden;
  border: 1px solid #e5dad5;
  border-radius: 22px;
  background: #ffffff;
  box-shadow: 0 12px 28px rgba(82, 61, 52, 0.07);
  cursor: pointer;
  transition:
    transform 180ms ease,
    box-shadow 180ms ease;
}

.buch-karte:hover,
.buch-karte:focus-visible {
  outline: none;
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(82, 61, 52, 0.14);
}

.cover-bereich {
  position: relative;
  aspect-ratio: 4 / 5;
  overflow: hidden;
  background: #eadfd9;
}

.buch-cover {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 250ms ease;
}

.buch-karte:hover .buch-cover {
  transform: scale(1.025);
}

.cover-platzhalter {
  display: flex;
  height: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #8b786f;
}

.karten-aktionen {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  gap: 8px;
}
.favorit-icon-button {
  color: rgb(var(--v-theme-error));
}
.favorit-button :deep(.v-icon) {
  color: rgb(var(--v-theme-error));
}

.aktion-button {
  background: rgba(255, 255, 255, 0.92);
  color: #956f63;
  box-shadow: 0 5px 16px rgba(62, 43, 36, 0.17);
}

.loeschen-button {
  color: #947872;
}

.buch-inhalt {
  padding: 20px;
}

.buch-autor {
  margin-bottom: 7px;
  color: #9b7e72;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.buch-titel {
  min-height: 2.7em;
  margin-bottom: 8px;
  color: #3f3531;
  font-size: 1.08rem;
  line-height: 1.35;
}

.buch-jahr {
  margin-bottom: 12px;
  color: #8e817b;
  font-size: 0.86rem;
}

.bewertung-bereich {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  margin-top: 10px;
}

.bewertung-zahl {
  margin-left: 7px;
  color: #735c52;
  font-weight: 800;
}

.bewertung-anzahl {
  margin-left: 4px;
  color: #a0928c;
  font-size: 0.82rem;
}

.details-button {
  display: flex;
  width: 100%;
  justify-content: space-between;
  margin-top: 18px;
  padding: 12px 0 2px;
  border: 0;
  background: transparent;
  color: #82675d;
  font: inherit;
  font-weight: 800;
  cursor: pointer;
}

.buchliste-leer {
  padding: 60px 24px;
  border: 1px dashed #d7c8c1;
  border-radius: 22px;
  background: #ffffff;
  color: #766861;
  text-align: center;
}

.buchliste-leer span {
  display: block;
  margin-bottom: 14px;
  font-size: 3rem;
}

.buchliste-leer h2 {
  margin-bottom: 8px;
  color: #493a34;
}

.buch-dialog {
  position: relative;
  overflow: hidden;
  border-radius: 26px;
  background: #faf7f5;
}

.dialog-schliessen {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 4;
  background: rgba(255, 255, 255, 0.85);
}

.dialog-layout {
  display: grid;
  grid-template-columns: minmax(250px, 0.75fr) minmax(0, 1.25fr);
}

.dialog-cover-bereich {
  min-height: 500px;
  background: #e8ddd7;
}

.dialog-cover {
  display: block;
  width: 100%;
  height: 100%;
  min-height: 500px;
  object-fit: cover;
}

.dialog-cover-platzhalter {
  display: flex;
  min-height: 500px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  color: #8b786f;
}

.dialog-inhalt {
  padding: 52px 44px 42px;
}

.dialog-kicker {
  margin-bottom: 10px;
  color: #98776a;
  font-size: 0.75rem;
  font-weight: 900;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.dialog-titel {
  margin-bottom: 10px;
  color: #3d302b;
  font-size: clamp(2rem, 4vw, 3.3rem);
  line-height: 1.06;
}

.dialog-autor {
  margin-bottom: 8px;
  color: #80685f;
  font-size: 1.05rem;
  font-weight: 700;
}

.dialog-jahr {
  color: #94847d;
  font-size: 0.9rem;
}

.dialog-beschreibung {
  margin: 28px 0;
  color: #6d605a;
  line-height: 1.8;
}

.dialog-bewertung {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  margin-bottom: 28px;
  color: #786961;
  font-size: 0.9rem;
}

.dialog-aktionen {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.favorit-button {
  border-radius: 13px;
  background: #a98f84;
  color: #ffffff;
  font-weight: 800;
  text-transform: none;
}

.login-button {
  border-radius: 13px;
  color: #765f56;
  font-weight: 700;
  text-transform: none;
}

@media (max-width: 1200px) {
  .buecher-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 850px) {
  .buecher-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .dialog-layout {
    grid-template-columns: 1fr;
  }

  .dialog-cover-bereich,
  .dialog-cover,
  .dialog-cover-platzhalter {
    min-height: 330px;
    max-height: 430px;
  }

  .dialog-inhalt {
    padding: 34px 26px;
  }
}

@media (max-width: 520px) {
  .buecher-grid {
    grid-template-columns: 1fr;
  }
}
</style>