<template>
  <main class="autoren-seite">
    <section class="autoren-hero">
      <div class="autoren-hero-inhalt">
        <p class="autoren-kicker">
          Stimmen hinter den Geschichten
        </p>

        <h1 class="autoren-haupttitel">
          Unsere Autorinnen und Autoren
        </h1>

        <p class="autoren-einleitung">
          Entdecke die Menschen hinter den Büchern und finde heraus,
          welche Werke bereits in unserer Bibliothek verfügbar sind.
        </p>

        <v-btn
          to="/bibliothek"
          variant="outlined"
          class="bibliothek-button"
        >
          Zur Bibliothek
        </v-btn>
      </div>

      <div class="autoren-hero-dekoration" aria-hidden="true">
        <span class="deko-buch deko-buch-eins">A</span>
        <span class="deko-buch deko-buch-zwei">B</span>
        <span class="deko-buch deko-buch-drei">C</span>
      </div>
    </section>

    <section class="autoren-inhalt">
      <div
        v-if="autorenWerdenGeladen"
        class="autoren-laden"
      >
        <v-progress-circular
          indeterminate
          size="42"
        />

        <p>Autoren werden geladen …</p>
      </div>

      <div
        v-else-if="autorStore.autoren.length === 0"
        class="autoren-leer"
      >
        <span>✍️</span>

        <h2>Keine Autoren gefunden</h2>

        <p>
          Momentan konnten keine Autoren aus der Bibliothek geladen werden.
        </p>
      </div>

      <AutorenListe v-else />
    </section>
  </main>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import AutorenListe from "@/components/AutorenListe.vue";
import { useAutorStore } from "@/stores/autorStore";

const autorStore = useAutorStore();
const autorenWerdenGeladen = ref(true);

onMounted(async () => {
  try {
    await autorStore.ladeAlleAutoren();
  } catch (error: unknown) {
    console.error("Fehler beim Laden der Autoren:", error);
  } finally {
    autorenWerdenGeladen.value = false;
  }
});
</script>

<style scoped>
.autoren-seite {
  min-height: 100%;
  background: rgb(var(--v-theme-background));
  color: rgb(var(--v-theme-textPrimary));
  transition:
    background-color 200ms ease,
    color 200ms ease;
}

.autoren-hero {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  align-items: center;
  min-height: 390px;
  padding: 64px clamp(28px, 7vw, 110px);
  overflow: hidden;
  background:
    radial-gradient(
      circle at 85% 25%,
      rgba(var(--v-theme-surface), 0.45),
      transparent 32%
    ),
    linear-gradient(
      135deg,
      rgb(var(--v-theme-heroStart)) 0%,
      rgb(var(--v-theme-heroEnd)) 100%
    );
}

.autoren-hero-inhalt {
  position: relative;
  z-index: 2;
  max-width: 760px;
}

.autoren-kicker {
  margin-bottom: 12px;
  color: rgb(var(--v-theme-primary));
  font-size: 0.82rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.autoren-haupttitel {
  max-width: 760px;
  margin-bottom: 18px;
  color: rgb(var(--v-theme-textPrimary));
  font-size: clamp(2.7rem, 5vw, 5rem);
  line-height: 1;
  letter-spacing: -0.045em;
}

.autoren-einleitung {
  max-width: 620px;
  margin-bottom: 28px;
  color: rgb(var(--v-theme-textMuted));
  font-size: 1.05rem;
  line-height: 1.75;
}

.bibliothek-button {
  border-color: rgb(var(--v-theme-primary));
  border-radius: 14px;
  color: rgb(var(--v-theme-textPrimary));
  font-weight: 800;
  text-transform: none;
}

.autoren-hero-dekoration {
  position: relative;
  min-height: 280px;
}

.deko-buch {
  position: absolute;
  display: flex;
  width: 105px;
  height: 190px;
  align-items: center;
  justify-content: center;
  border-radius: 7px 17px 17px 7px;
  color: rgba(255, 255, 255, 0.82);
  font-family: Georgia, serif;
  font-size: 2.4rem;
  font-weight: 700;
  box-shadow: 0 24px 38px rgba(0, 0, 0, 0.24);
}

.deko-buch-eins {
  top: 55px;
  left: 20px;
  z-index: 1;
  transform: rotate(-12deg);
  background: #728675;
}

.deko-buch-zwei {
  top: 25px;
  left: 112px;
  z-index: 3;
  transform: rotate(3deg);
  background: #a37c70;
}

.deko-buch-drei {
  top: 65px;
  left: 205px;
  z-index: 2;
  transform: rotate(13deg);
  background: #c49b73;
}

.autoren-inhalt {
  min-height: 380px;
  padding: 64px clamp(28px, 7vw, 110px) 90px;
  background: rgb(var(--v-theme-background));
}

.autoren-laden {
  display: flex;
  min-height: 240px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: rgb(var(--v-theme-textMuted));
}

.autoren-leer {
  padding: 54px 28px;
  border: 1px dashed rgb(var(--v-theme-cardBorder));
  border-radius: 22px;
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-textMuted));
  text-align: center;
}

.autoren-leer span {
  display: block;
  margin-bottom: 16px;
  font-size: 3rem;
}

.autoren-leer h2 {
  margin-bottom: 10px;
  color: rgb(var(--v-theme-textPrimary));
}

.autoren-leer p {
  margin: 0;
  color: rgb(var(--v-theme-textMuted));
}

@media (max-width: 900px) {
  .autoren-hero {
    grid-template-columns: 1fr;
  }

  .autoren-hero-dekoration {
    display: none;
  }
}

@media (max-width: 600px) {
  .autoren-hero,
  .autoren-inhalt {
    padding-right: 22px;
    padding-left: 22px;
  }

  .autoren-hero {
    min-height: auto;
    padding-top: 52px;
    padding-bottom: 52px;
  }

  .autoren-haupttitel {
    font-size: 2.8rem;
  }
}
</style>

