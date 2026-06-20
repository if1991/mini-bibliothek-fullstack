<template>
  <v-row>
    <v-col cols="12" md="5">
      <v-text-field
        v-model="neuerTitel"
        hide-details
        label="Buchtitel"
        variant="outlined"
      />
    </v-col>

    <v-col cols="12" md="5">
      <v-select
        v-model="ausgewaehlterAutorId"
        clearable
        hide-details
        item-title="name"
        item-value="_id"
        :items="autorStore.autoren"
        label="Autor auswählen"
        variant="outlined"
      >
        <template #item="{ props, item }">
          <v-list-item
            v-bind="props"
            :title="`${item.raw.vorname} ${item.raw.name}`"
          />
        </template>
      </v-select>
    </v-col>

    <v-col cols="12" md="2">
      <v-btn
        block
        color="#C5E1A5"
        size="large"
        @click="buchSpeichern"
      >
        Buch speichern
      </v-btn>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">

  import { onMounted, ref } from "vue";
  import { useAutorStore } from "@/stores/autorStore";
  import { useBuchStore } from "@/stores/buchStore";

  const buchStore = useBuchStore();
  const autorStore = useAutorStore();

  const neuerTitel = ref("");
  const ausgewaehlterAutorId = ref<string | null>(null);

  onMounted(() => {
    autorStore.ladeAlleAutoren();
  });

  const buchSpeichern = () => {
    const titel = neuerTitel.value;
    const autorId = ausgewaehlterAutorId.value;

    if (!titel || !autorId) {
      alert("Bitte Titel und Autor auswählen.");
      return;
    }

    buchStore.buchHinzufuegen(titel, autorId);

    neuerTitel.value = "";
    ausgewaehlterAutorId.value = null;
  };
</script>
