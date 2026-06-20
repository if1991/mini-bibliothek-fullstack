<template>
  <section class="autoren-section">
    <h2 class="autoren-title">Unsere Autoren</h2>

    <div v-if="autorenMitBuechern.length === 0" class="autoren-empty">
      Keine Autoren gefunden.
    </div>

    <template v-else>
      <div class="autoren-grid">
        <div
          v-for="autor in sichtbareAutoren"
          :key="autor._id"
          class="autor-card"
        >
          <div class="autor-card-left">
            <div class="autor-avatar">
              {{ autor.name?.charAt(0) || "?" }}
            </div>

            <div class="autor-info">
              <a href="#" class="autor-name">
                {{ autor.vorname || "" }}
                {{ autor.name || "Unbekannter Autor" }}
              </a>

              <p class="autor-subtitle">
                Autor in der Bibliothek
              </p>
            </div>
          </div>

          <div class="autor-count">
            {{ autor.buecher?.length ?? 0 }} Bücher
          </div>
        </div>
      </div>

      <div v-if="anzahlSeiten > 1" class="autoren-pagination">
        <button
          class="autoren-pagination-button"
          type="button"
          :disabled="aktuelleSeite === 1"
          @click="geheZuSeite(aktuelleSeite - 1)"
        >
          ‹
        </button>

        <button
          v-for="seite in anzahlSeiten"
          :key="seite"
          class="autoren-pagination-button"
          :class="{
            'autoren-pagination-button--active':
              aktuelleSeite === seite
          }"
          type="button"
          @click="geheZuSeite(seite)"
        >
          {{ seite }}
        </button>

        <button
          class="autoren-pagination-button"
          type="button"
          :disabled="aktuelleSeite === anzahlSeiten"
          @click="geheZuSeite(aktuelleSeite + 1)"
        >
          ›
        </button>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useAutorStore } from "@/stores/autorStore";

const autorStore = useAutorStore();
const aktuelleSeite = ref(1);
const autorenProSeite = 8;

const autorenMitBuechern = computed(() => {
  return autorStore.autoren
    .filter((autor) => {
      return (autor.buecher?.length ?? 0) > 0;
    })
    .sort((autorA, autorB) => {
      return (autorB.buecher?.length ?? 0) - (autorA.buecher?.length ?? 0);
    });
});
const anzahlSeiten = computed(() => {
  return Math.ceil(autorenMitBuechern.value.length / autorenProSeite);
});

const sichtbareAutoren = computed(() => {
  const startIndex = (aktuelleSeite.value - 1) * autorenProSeite;
  const endIndex = startIndex + autorenProSeite;

  return autorenMitBuechern.value.slice(startIndex, endIndex);
});

function geheZuSeite(seite: number) {
  if (seite < 1) {
    return;
  }

  if (seite > anzahlSeiten.value) {
    return;
  }

  aktuelleSeite.value = seite;
}
</script>

<style scoped>
.autoren-section {
  width: 100%;
  margin-top: 40px;
}

.autoren-title {
  margin-bottom: 24px;
  color: rgb(var(--v-theme-textPrimary));
  font-size: 2rem;
  line-height: 1.2;
}

.autoren-empty {
  padding: 40px 24px;
  border: 1px dashed rgb(var(--v-theme-cardBorder));
  border-radius: 20px;
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-textMuted));
  text-align: center;
}

.autoren-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 22px;
}

.autor-card {
  display: flex;
  min-width: 0;
  min-height: 130px;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 22px;
  border: 1px solid rgb(var(--v-theme-cardBorder));
  border-radius: 20px;
  background: rgb(var(--v-theme-surface));
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.12);
  transition:
    transform 180ms ease,
    box-shadow 180ms ease,
    background-color 200ms ease,
    border-color 200ms ease;
}

.autor-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 17px 34px rgba(0, 0, 0, 0.18);
}

.autor-card-left {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 14px;
}

.autor-avatar {
  display: flex;
  width: 46px;
  height: 46px;
  flex: 0 0 46px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgb(var(--v-theme-secondary));
  color: rgb(var(--v-theme-textPrimary));
  font-weight: 800;
}

.autor-info {
  min-width: 0;
}

.autor-name {
  display: block;
  margin-bottom: 6px;
  color: rgb(var(--v-theme-textPrimary));
  font-size: 0.95rem;
  font-weight: 800;
  line-height: 1.35;
  text-decoration: none;
  overflow-wrap: normal;
  word-break: normal;
}

.autor-name:hover {
  color: rgb(var(--v-theme-primary));
}

.autor-subtitle {
  margin: 0;
  color: rgb(var(--v-theme-textMuted));
  font-size: 0.8rem;
  line-height: 1.45;
}

.autor-count {
  flex-shrink: 0;
  padding: 7px 10px;
  border-radius: 999px;
  background: rgb(var(--v-theme-softSurface));
  color: rgb(var(--v-theme-textPrimary));
  font-size: 0.74rem;
  font-weight: 800;
  white-space: nowrap;
}

.autoren-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 28px;
}

.autoren-pagination-button {
  min-width: 38px;
  height: 38px;
  padding: 0 12px;
  border: 1px solid rgb(var(--v-theme-cardBorder));
  border-radius: 999px;
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-textPrimary));
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  transition:
    background-color 160ms ease,
    color 160ms ease,
    border-color 160ms ease,
    transform 160ms ease;
}

.autoren-pagination-button:hover:not(:disabled) {
  background: rgb(var(--v-theme-softSurface));
  transform: translateY(-1px);
}

.autoren-pagination-button--active {
  border-color: rgb(var(--v-theme-primary));
  background: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
}

.autoren-pagination-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

@media (max-width: 1250px) {
  .autoren-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .autoren-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .autoren-grid {
    grid-template-columns: 1fr;
  }

  .autor-card {
    min-height: auto;
  }
}
</style>

