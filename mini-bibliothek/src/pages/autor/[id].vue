```vue
<template>
  <v-container>
    <div
      v-if="!autor"
      class="text-center"
    >
      <v-progress-circular
        color="brown-darken-1"
        indeterminate
      />

      <p class="mt-4">
        Autor wird geladen …
      </p>
    </div>

    <div v-else>
      <v-card variant="tonal">
        <v-card-title class="text-h4">
          {{ autor.vorname }} {{ autor.name }}
        </v-card-title>

        <v-card-text>
          <p v-if="autor.land">
            <strong>Land:</strong>
            {{ autor.land }}
          </p>

          <p v-if="autor.geburtsdatum">
            <strong>Geburtsdatum:</strong>
            {{
              new Date(
                autor.geburtsdatum
              ).toLocaleDateString("de-DE")
            }}
          </p>
        </v-card-text>
      </v-card>

      <h2 class="text-h5 mt-8 mb-2">
        Bücher dieses Autors
      </h2>

      <v-list lines="one">
        <v-list-item
          v-for="buch in autor.buecher"
          :key="buch._id"
          :title="buch.titel"
        >
          <template #prepend>
            <v-icon>
              mdi-book-open-variant
            </v-icon>
          </template>
        </v-list-item>
      </v-list>
    </div>
  </v-container>
</template>
```


<script setup lang="ts">
  import type { IAutor } from "@/types/models";
  import { onMounted, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import { useAutorStore } from '@/stores/autorStore';

  const route = useRoute();
  const autorStore = useAutorStore();


  const autor = ref<IAutor | null>(null);

  onMounted(async () => {
    const { id } = route.params as { id: string };

    const geladenerAutor = await autorStore.gibEinAutorUndSeineBuecher(id);
    autor.value = geladenerAutor;
  });
</script>