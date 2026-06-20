```vue
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
            Registrieren
          </v-card-title>

          <v-card-text>
            <v-form @submit.prevent="handleRegister">
              <v-text-field
                v-model="vorname"
                class="mb-4"
                label="Vorname"
                required
                variant="outlined"
              />

              <v-text-field
                v-model="name"
                class="mb-4"
                label="Nachname"
                required
                variant="outlined"
              />

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
                Registrieren
              </v-btn>
            </v-form>
          </v-card-text>

          <v-card-actions class="justify-center">
            <span>Du hast bereits ein Konto?</span>

            <v-btn
              color="primary"
              to="/login"
              variant="text"
            >
              Jetzt anmelden
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
```


<script setup lang="ts">
  import { ref } from "vue";
  import { useRouter } from "vue-router";
  import { useAuthStore } from "@/stores/authStore";


  const name = ref("");
  const vorname = ref("");
  const email = ref("");
  const password = ref("");
  const errorMsg = ref<string | null>(null);
  const isLoading = ref(false);

  const authStore = useAuthStore();
  const router = useRouter();

  const handleRegister = async () => {
    isLoading.value = true;
    errorMsg.value = null;

    try {
      await authStore.registrieren(
        name.value,
        vorname.value,
        email.value,
        password.value,
      );

      alert("Registrierung erfolgreich! Du kannst dich jetzt anmelden.");
      router.push("/login");
    } catch (error: any) {
      errorMsg.value = error.message ||
  "Bei der Registrierung ist ein Fehler aufgetreten.";
    } finally {
      isLoading.value = false;
    }
  };
</script>
