<template>
  <main class="startseite">
    <section class="hero">
      <div class="hero-inhalt">
        <p class="hero-kicker">
          Deine digitale Bücherwelt
        </p>

        <h1 class="hero-titel">
          Bücher entdecken,<br>
          Geschichten sammeln.
        </h1>

        <p class="hero-text">
          Durchstöbere unsere Bibliothek, entdecke spannende Autorinnen
          und Autoren und speichere deine persönlichen Favoriten.
        </p>

        <div class="hero-buttons">
          <v-btn
            to="/bibliothek"
            size="large"
            class="primaer-button"
          >
            Bibliothek entdecken
          </v-btn>

          <v-btn
            to="/autoren"
            size="large"
            variant="outlined"
            class="sekundaer-button"
          >
            Autoren ansehen
          </v-btn>
        </div>
      </div>
       <div class="hero-dekoration" aria-hidden="true">
  <div
    v-for="(buch, index) in heroBuecher"
    :key="buch._id"
    class="hero-cover-karte"
    :class="`hero-cover-${index + 1}`"
  >
    <img
      v-if="buch.coverBild"
      :src="buch.coverBild"
      :alt="buch.titel"
      class="hero-cover-bild"
    >

    <div
      v-else
      class="hero-cover-platzhalter"
    >
      <v-icon size="52">
        mdi-book-open-page-variant-outline
      </v-icon>

      <span>{{ buch.titel }}</span>
    </div>
  </div>
</div>
    </section>

    <section class="startbereich">
      <div class="bereich-kopf">
        <div>
          <p class="bereich-kicker">
            Aus unserer Sammlung
          </p>

          <h2 class="bereich-titel">
            Bücher zum Entdecken
          </h2>
        </div>

        <v-btn
          to="/bibliothek"
          variant="text"
          class="alle-anzeigen-button"
        >
          Alle Bücher ansehen →
        </v-btn>
      </div>

      <div
        v-if="buchStore.buecher.length === 0"
        class="leerer-bereich"
      >
        Momentan konnten keine Bücher geladen werden.
      </div>

      <div
        v-else
        class="buecher-grid"
      >
        <article
          v-for="buch in angezeigteBuecher"
          :key="buch._id"
          class="buch-karte"
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
              <span>📖</span>
              <small>Kein Cover</small>
            </div>
          </div>

          <div class="buch-inhalt">
            <p class="buch-autor">
              {{ autorNameErmitteln(buch) }}
            </p>

            <h3 class="buch-titel">
              {{ buch.titel }}
            </h3>

            <div class="buch-bewertung">
              <span>★</span>

              <span>
                {{ bewertungFormatieren(buch.durchschnittsBewertung) }}
              </span>

              <small>
                ({{ buch.anzahlBewertungen ?? 0 }})
              </small>
            </div>
          </div>
        </article>
      </div>
    </section>

    <section class="vorteile-bereich">
      <div class="vorteile-text">
        <p class="bereich-kicker">
          Mehr mit einem Konto
        </p>

        <h2 class="bereich-titel">
          Deine persönliche Bibliothek
        </h2>

        <p>
          Die Bücher und Autoren kannst du auch ohne Anmeldung ansehen.
          Mit einem Konto kannst du zusätzlich Favoriten speichern,
          Bücher bewerten und später eine eigene Leseliste führen.
        </p>

        <div
          v-if="!authStore.isLoggedIn"
          class="konto-buttons"
        >
          <v-btn
            to="/register"
            class="primaer-button"
          >
            Kostenlos registrieren
          </v-btn>

          <v-btn
            to="/login"
            variant="text"
          >
            Bereits registriert? Anmelden
          </v-btn>
        </div>

        <v-btn
          v-else
          to="/meine-buecher"
          class="primaer-button"
        >
          Meine Favoriten ansehen
        </v-btn>
      </div>

      <div class="vorteile-grid">
        <article class="vorteil-karte">
          <span class="vorteil-icon">♡</span>
          <h3>Favoriten speichern</h3>
          <p>
            Halte die Bücher fest, die du besonders interessant findest.
          </p>
        </article>

        <article class="vorteil-karte">
          <span class="vorteil-icon">★</span>
          <h3>Bücher bewerten</h3>
          <p>
            Teile deine Meinung und entdecke beliebte Bücher.
          </p>
        </article>

        <article class="vorteil-karte">
          <span class="vorteil-icon">✓</span>
          <h3>Leseliste planen</h3>
          <p>
            Merke dir Bücher, die du als Nächstes lesen möchtest.
          </p>
        </article>
      </div>
    </section>
  </main>
</template>

<script lang="ts" setup>
import { computed, onMounted } from "vue";
import type { IBuch } from "@/types/models";
import { useAuthStore } from "@/stores/authStore";
import { useBuchStore } from "@/stores/buchStore";

const buchStore = useBuchStore();
const authStore = useAuthStore();

const angezeigteBuecher = computed(() => {
  return buchStore.buecher.slice(0, 4);
});
const heroBuecher = computed(() => {
  return buchStore.buecher
    .filter(buch => Boolean(buch.coverBild))
    .slice(0, 3);
});

function autorNameErmitteln(buch: IBuch): string {
  const autor = buch.autor;

  if (!autor) {
    return "Unbekannter Autor";
  }

  const vorname = autor.vorname ?? "";
  const nachname = autor.name ?? "";

  const vollstaendigerName =
    (vorname + " " + nachname).trim();

  if (vollstaendigerName.length === 0) {
    return "Unbekannter Autor";
  }

  return vollstaendigerName;
}

function bewertungFormatieren(
  bewertung: number | undefined
): string {
  if (!bewertung) {
    return "0,0";
  }

  return bewertung.toFixed(1).replace(".", ",");
}

onMounted(() => {
  buchStore.ladeAlleBuecher(4, 0);
});
</script>

<style scoped>
.startseite {
  min-height: 100%;
  background: rgb(var(--v-theme-background));
  color: rgb(var(--v-theme-textPrimary));
  transition:
    background-color 200ms ease,
    color 200ms ease;
}

.hero {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(280px, 0.75fr);
  align-items: center;
  min-height: 540px;
  padding: 72px clamp(32px, 7vw, 120px);
  overflow: hidden;
  background:
    radial-gradient(
      circle at 85% 20%,
      rgba(var(--v-theme-surface), 0.48),
      transparent 30%
    ),
    linear-gradient(
      135deg,
      rgb(var(--v-theme-heroStart)) 0%,
      rgb(var(--v-theme-heroEnd)) 100%
    );
}

.hero-inhalt {
  position: relative;
  z-index: 2;
  max-width: 720px;
}

.hero-kicker,
.bereich-kicker {
  margin-bottom: 12px;
  color: rgb(var(--v-theme-primary));
  font-size: 0.82rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.hero-titel {
  max-width: 750px;
  margin-bottom: 22px;
  color: rgb(var(--v-theme-textPrimary));
  font-size: clamp(3rem, 6vw, 5.7rem);
  line-height: 0.98;
  letter-spacing: -0.05em;
}

.hero-text {
  max-width: 610px;
  margin-bottom: 32px;
  color: rgb(var(--v-theme-textMuted));
  font-size: 1.1rem;
  line-height: 1.75;
}

.hero-buttons,
.konto-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  align-items: center;
}

.primaer-button {
  border-radius: 14px;
  background: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
  font-weight: 800;
  text-transform: none;
}

.sekundaer-button {
  border-color: rgb(var(--v-theme-primary));
  border-radius: 14px;
  color: rgb(var(--v-theme-textPrimary));
  font-weight: 800;
  text-transform: none;
}

.hero-dekoration {
  position: relative;
  min-height: 400px;
}
.hero-cover-karte {
  position: absolute;
  width: 190px;
  aspect-ratio: 2 / 3;
  overflow: hidden;
  border: 1px solid rgba(var(--v-theme-onSurface), 0.12);
  border-radius: 18px;
  background: rgb(var(--v-theme-surface));
  box-shadow:
    0 28px 55px rgba(0, 0, 0, 0.28);
  transition:
    transform 220ms ease,
    box-shadow 220ms ease;
}

.hero-cover-karte:hover {
  z-index: 10;
  box-shadow:
    0 35px 65px rgba(0, 0, 0, 0.38);
}

.hero-cover-1 {
  top: 78px;
  left: 10px;
  z-index: 1;
  transform: rotate(-11deg);
}

.hero-cover-1:hover {
  transform: rotate(-6deg) translateY(-8px);
}

.hero-cover-2 {
  top: 28px;
  left: 135px;
  z-index: 3;
  transform: rotate(2deg);
}

.hero-cover-2:hover {
  transform: rotate(0deg) translateY(-8px);
}

.hero-cover-3 {
  top: 85px;
  left: 260px;
  z-index: 2;
  transform: rotate(11deg);
}

.hero-cover-3:hover {
  transform: rotate(6deg) translateY(-8px);
}

.hero-cover-bild {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-cover-platzhalter {
  display: flex;
  height: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 20px;
  color: rgb(var(--v-theme-textMuted));
  text-align: center;
}
.startbereich,
.vorteile-bereich {
  padding: 72px clamp(32px, 7vw, 120px);
}

.startbereich {
  background: rgb(var(--v-theme-background));
}

.bereich-kopf {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  align-items: flex-end;
  margin-bottom: 30px;
}

.bereich-titel {
  margin: 0;
  color: rgb(var(--v-theme-textPrimary));
  font-size: clamp(2rem, 4vw, 3rem);
  letter-spacing: -0.035em;
}

.alle-anzeigen-button {
  color: rgb(var(--v-theme-primary));
  font-weight: 800;
  text-transform: none;
}

.buecher-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 24px;
}

.buch-karte {
  overflow: hidden;
  border: 1px solid rgb(var(--v-theme-cardBorder));
  border-radius: 22px;
  background: rgb(var(--v-theme-surface));
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.11);
  transition:
    transform 180ms ease,
    box-shadow 180ms ease,
    background-color 200ms ease;
}

.buch-karte:hover {
  transform: translateY(-5px);
  box-shadow: 0 18px 38px rgba(0, 0, 0, 0.18);
}

.cover-bereich {
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
  gap: 10px;
  color: rgb(var(--v-theme-textMuted));
}

.cover-platzhalter span {
  font-size: 3rem;
}

.buch-inhalt {
  padding: 20px;
}

.buch-autor {
  margin-bottom: 8px;
  color: rgb(var(--v-theme-primary));
  font-size: 0.82rem;
  font-weight: 800;
  text-transform: uppercase;
}

.buch-titel {
  min-height: 2.8em;
  margin-bottom: 14px;
  color: rgb(var(--v-theme-textPrimary));
  font-size: 1.1rem;
  line-height: 1.35;
}

.buch-bewertung {
  display: flex;
  gap: 6px;
  align-items: center;
  color: rgb(var(--v-theme-warning));
  font-weight: 700;
}

.buch-bewertung small {
  color: rgb(var(--v-theme-textMuted));
  font-weight: 500;
}

.leerer-bereich {
  padding: 28px;
  border: 1px dashed rgb(var(--v-theme-cardBorder));
  border-radius: 18px;
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-textMuted));
}

.vorteile-bereich {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
  gap: 64px;
  align-items: center;
  background: rgb(var(--v-theme-softSurface));
}

.vorteile-text > p:not(.bereich-kicker) {
  max-width: 620px;
  margin: 20px 0 28px;
  color: rgb(var(--v-theme-textMuted));
  line-height: 1.75;
}

.vorteile-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.vorteil-karte {
  min-height: 210px;
  padding: 24px;
  border: 1px solid rgb(var(--v-theme-cardBorder));
  border-radius: 20px;
  background: rgba(var(--v-theme-surface), 0.82);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
}

.vorteil-icon {
  display: inline-flex;
  width: 44px;
  height: 44px;
  align-items: center;
  justify-content: center;
  margin-bottom: 18px;
  border-radius: 50%;
  background: rgb(var(--v-theme-secondary));
  color: rgb(var(--v-theme-on-secondary));
  font-size: 1.3rem;
  font-weight: 800;
}

.vorteil-karte h3 {
  margin-bottom: 10px;
  color: rgb(var(--v-theme-textPrimary));
  font-size: 1.05rem;
}

.vorteil-karte p {
  margin: 0;
  color: rgb(var(--v-theme-textMuted));
  font-size: 0.92rem;
  line-height: 1.6;
}

@media (max-width: 1050px) {
  .hero {
    grid-template-columns: 1fr;
  }

  .hero-dekoration {
    display: none;
  }

  .buecher-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .vorteile-bereich {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 700px) {
  .hero,
  .startbereich,
  .vorteile-bereich {
    padding-right: 22px;
    padding-left: 22px;
  }

  .hero {
    min-height: auto;
    padding-top: 58px;
    padding-bottom: 58px;
  }

  .hero-titel {
    font-size: 3rem;
  }

  .bereich-kopf {
    align-items: flex-start;
    flex-direction: column;
  }

  .buecher-grid,
  .vorteile-grid {
    grid-template-columns: 1fr;
  }

  .hero-buttons,
  .konto-buttons {
    align-items: stretch;
    flex-direction: column;
  }

  .hero-buttons .v-btn,
  .konto-buttons .v-btn {
    width: 100%;
  }
}
</style>