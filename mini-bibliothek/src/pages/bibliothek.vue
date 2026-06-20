<template>
  <main class="bibliothek-seite">
    <section class="bibliothek-header">
      <div>
        <p class="bibliothek-kicker">
          Unsere Sammlung
        </p>

        <h1 class="bibliothek-titel">
          Bibliothek
        </h1>

        <p class="bibliothek-text">
          Entdecke Bücher aus unserer Sammlung, sieh dir Details an
          und speichere deine Favoriten.
        </p>
      </div>

      <v-btn
        to="/entdecken"
        class="entdecken-button"
        prepend-icon="mdi-bookshelf"
      >
        Weitere Bücher entdecken
      </v-btn>
    </section>

    <section class="bibliothek-inhalt">
      <div class="bibliothek-toolbar">
        <div>
          <h2>
            {{
              aktuellerSuchbegriff
                ? "Suchergebnisse"
                : "Alle Bücher"
            }}
          </h2>

          <p>
            {{ buchStore.buecherGesamt }}
            {{
              buchStore.buecherGesamt === 1
                ? "Buch gefunden"
                : "Bücher gefunden"
            }}
          </p>
        </div>

        <v-chip
          v-if="aktuellerSuchbegriff"
          closable
          class="suchbegriff-chip"
          @click:close="sucheZuruecksetzen"
        >
          Suche: „{{ aktuellerSuchbegriff }}“
        </v-chip>
      </div>

      <div
        v-if="datenWerdenGeladen"
        class="bibliothek-laden"
      >
        <v-progress-circular
          indeterminate
          size="44"
        />

        <p>Bücher werden geladen …</p>
      </div>

      <template v-else>
        <div
  v-if="
    buchStore.buecher.length === 0 &&
    aktuellerSuchbegriff
  "
  class="keine-treffer"
>
  <v-icon size="58">
    mdi-book-search-outline
  </v-icon>

  <h2>Dieses Buch ist noch nicht in unserer Bibliothek</h2>

  <p>
    Suche nach „{{ aktuellerSuchbegriff }}“ in Open Library
    und übernimm ein passendes Buch in unsere Sammlung.
  </p>

  <v-btn
    :to="{
      path: '/entdecken',
      query: { q: aktuellerSuchbegriff }
    }"
    class="extern-suchen-button"
    prepend-icon="mdi-library-search"
  >
    In Open Library suchen
  </v-btn>
</div>

<BuchListe
  v-else
  :books="buchStore.buecher"
/>

        <div
          v-if="anzahlSeiten > 1"
          class="pagination-bereich"
        >
          <v-pagination
            v-model="aktuelleSeite"
            :length="anzahlSeiten"
            rounded="circle"
          />
        </div>
      </template>
    </section>
  </main>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import BuchListe from "@/components/BuchListe.vue";
import { useBuchStore } from "@/stores/buchStore";

const buchStore = useBuchStore();
const route = useRoute();
const router = useRouter();

const aktuelleSeite = ref(1);
const buecherProSeite = 8;
const datenWerdenGeladen = ref(false);

const aktuellerSuchbegriff = computed(() => {
  const suchbegriff = route.query.q;

  if (typeof suchbegriff !== "string") {
    return "";
  }

  return suchbegriff.trim();
});

const anzahlSeiten = computed(() => {
  const gesamtanzahl = buchStore.buecherGesamt ?? 0;

  if (gesamtanzahl === 0) {
    return 1;
  }

  return Math.ceil(gesamtanzahl / buecherProSeite);
});

async function ladeDatenFuerSeite(
  seite: number
): Promise<void> {
  datenWerdenGeladen.value = true;

  try {
    const offset = (seite - 1) * buecherProSeite;

    let suchbegriff: string | undefined;

    if (aktuellerSuchbegriff.value.length > 0) {
      suchbegriff = aktuellerSuchbegriff.value;
    }

    await Promise.all([
      buchStore.ladeAlleBuecher(
        buecherProSeite,
        offset,
        suchbegriff
      ),
      buchStore.ladeBuecherAnzahl(suchbegriff),
    ]);
  } finally {
    datenWerdenGeladen.value = false;
  }
}

function sucheZuruecksetzen(): void {
  router.replace({
    path: "/bibliothek",
  });
}

watch(aktuelleSeite, neueSeite => {
  ladeDatenFuerSeite(neueSeite);
});

watch(
  () => route.query.q,
  () => {
    if (aktuelleSeite.value === 1) {
      ladeDatenFuerSeite(1);
      return;
    }

    aktuelleSeite.value = 1;
  }
);

onMounted(() => {
  ladeDatenFuerSeite(1);
});
</script>


<style scoped>
.bibliothek-seite {
  min-height: 100%;
  background: rgb(var(--v-theme-background));
  color: rgb(var(--v-theme-textPrimary));
  transition:
    background-color 200ms ease,
    color 200ms ease;
}

.bibliothek-header {
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
      rgb(var(--v-theme-heroStart)) 0%,
      rgb(var(--v-theme-heroEnd)) 100%
    );
}

.bibliothek-kicker {
  margin-bottom: 10px;
  color: rgb(var(--v-theme-primary));
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.bibliothek-titel {
  margin-bottom: 14px;
  color: rgb(var(--v-theme-textPrimary));
  font-size: clamp(2.8rem, 5vw, 4.8rem);
  line-height: 1;
  letter-spacing: -0.045em;
}

.bibliothek-text {
  max-width: 640px;
  margin: 0;
  color: rgb(var(--v-theme-textMuted));
  font-size: 1.02rem;
  line-height: 1.7;
}

.entdecken-button {
  flex-shrink: 0;
  border-radius: 14px;
  background: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
  font-weight: 800;
  text-transform: none;
}

.bibliothek-inhalt {
  min-height: 500px;
  padding: 56px clamp(28px, 6vw, 100px) 90px;
  background: rgb(var(--v-theme-background));
}

.bibliothek-toolbar {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  align-items: center;
  margin-bottom: 30px;
}

.bibliothek-toolbar h2 {
  margin-bottom: 5px;
  color: rgb(var(--v-theme-textPrimary));
  font-size: 2rem;
}

.bibliothek-toolbar p {
  margin: 0;
  color: rgb(var(--v-theme-textMuted));
}

.suchbegriff-chip {
  background: rgb(var(--v-theme-secondary));
  color: rgb(var(--v-theme-textPrimary));
  font-weight: 700;
}

.bibliothek-laden {
  display: flex;
  min-height: 300px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: rgb(var(--v-theme-textMuted));
}

.pagination-bereich {
  display: flex;
  justify-content: center;
  margin-top: 42px;
}

/* Keine Treffer bei der lokalen Suche */
.keine-treffer {
  display: flex;
  min-height: 320px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  border: 1px dashed rgb(var(--v-theme-cardBorder));
  border-radius: 22px;
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-textMuted));
  text-align: center;
}

.keine-treffer h2 {
  margin: 16px 0 8px;
  color: rgb(var(--v-theme-textPrimary));
}

.keine-treffer p {
  max-width: 560px;
  margin: 0 0 22px;
  color: rgb(var(--v-theme-textMuted));
  line-height: 1.65;
}

.extern-suchen-button {
  border-radius: 13px;
  background: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
  font-weight: 800;
  text-transform: none;
}

@media (max-width: 760px) {
  .bibliothek-header {
    align-items: flex-start;
    flex-direction: column;
    padding-right: 22px;
    padding-left: 22px;
  }

  .entdecken-button {
    width: 100%;
  }

  .bibliothek-inhalt {
    padding-right: 22px;
    padding-left: 22px;
  }

  .bibliothek-toolbar {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
