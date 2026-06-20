<template>
  <v-snackbar
    v-model="visible"
    class="z-50 whitespace-pre-line"
    color="#fff8e1"
    location="top center"
    text-color="black"
    :timeout="timeout"
  >
    {{ message }}
    <template #actions>
      <v-btn color="black" variant="text" @click="visible = false">
        Schließen
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script setup lang="ts">
  import { ref } from "vue";

  const visible = ref(false);
  const message = ref("");
  const timeout = ref(3000); // kannst du anpassen

  function showToast(msg: string, duration = 3000) {
    message.value = msg;
    timeout.value = duration;
    visible.value = true;
  }

  defineExpose({ showToast });
</script>
