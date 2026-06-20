<template>
  <v-container>
    <v-row justify="center">
      <v-col
        cols="12"
        md="6"
        lg="4"
      >
        <v-card class="pa-4">
          <v-card-title class="text-h5 text-center">
            Anmelden
          </v-card-title>

          <v-card-text>
            <v-form @submit.prevent="handleLogin">
              <v-text-field
                v-model="email"
                class="mb-4"
                label="E-Mail-Adresse"
                required
                type="email"
                variant="outlined"
              />

              <v-text-field
                v-model="password"
                class="mb-4"
                label="Passwort"
                required
                type="password"
                variant="outlined"
              />

              <v-alert
                v-if="errorMsg"
                class="mb-4"
                type="error"
                variant="tonal"
              >
                {{ errorMsg }}
              </v-alert>

              <v-btn
                block
                color="success"
                :loading="isLoading"
                size="large"
                type="submit"
              >
                Anmelden
              </v-btn>
            </v-form>
          </v-card-text>

          <v-card-actions class="justify-center">
            <span>Noch kein Konto?</span>

            <v-btn
              color="primary"
              to="/register"
              variant="text"
            >
              Jetzt registrieren
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>


<script setup lang="ts">
  import { ref } from "vue";
  import { useRouter } from "vue-router";
  import { useAuthStore } from "@/stores/authStore";

  const email = ref("");
  const password = ref("");
  const errorMsg = ref<string | null>(null);
  const isLoading = ref(false);

  const authStore = useAuthStore();
  const router = useRouter();

  const handleLogin = async () => {
    isLoading.value = true;
    errorMsg.value = null;

    try {
      await authStore.einloggen(email.value, password.value);

      router.push("/");
    } catch (error: any) {
      errorMsg.value = error.message || "Ein unbekannter Fehler ist aufgetreten.";
    } finally {
      isLoading.value = false;
    }
  };
</script>

<style scoped></style>
