<template>
  <v-layout>
    <v-app>
      <v-app-bar
        color="surface"
        flat
        height="64"
      >
        <v-app-bar-nav-icon
          v-if="istKleineAnsicht"
          aria-label="Navigation öffnen"
          @click="navigationOffen = !navigationOffen"
        />

        <v-app-bar-title class="appbar-title">
          <span class="titel-voll">
            Meine Mini-Bibliothek
          </span>

          <span class="titel-kurz">
            Mini-Bibliothek
          </span>
        </v-app-bar-title>

        <div class="appbar-center">
          <v-text-field
            v-model="globalSearch"
            class="appbar-search"
            clearable
            density="compact"
            hide-details
            label="In unserer Bibliothek suchen"
            prepend-inner-icon="mdi-magnify"
            role="search"
            variant="outlined"
            @click:clear="resetSearch"
            @keydown.esc="resetSearch"
            @keyup.enter="submitSearch"
          />
        </div>

        <div class="appbar-right">
          <template v-if="!istKleineAnsicht">
            <span
              v-if="authStore.isLoggedIn"
              class="topbar-benutzer"
            >
              Hallo, {{ authStore.userName }}
            </span>

            <div
              v-else
              class="topbar-auth"
            >
              <v-btn
                to="/login"
                variant="text"
                class="topbar-link"
              >
                Anmelden
              </v-btn>

              <v-btn
                to="/register"
                variant="outlined"
                class="topbar-register"
              >
                Registrieren
              </v-btn>
            </div>
          </template>

          <v-btn
            icon
            aria-label="Farbschema wechseln"
            @click="toggleDarkMode"
          >
            <v-icon>
              {{
                isDark
                  ? "mdi-weather-sunny"
                  : "mdi-weather-night"
              }}
            </v-icon>
          </v-btn>
        </div>
      </v-app-bar>

      <v-navigation-drawer
        v-model="navigationOffen"
        class="hauptnavigation"
        color="surface"
        location="left"
        :permanent="!istKleineAnsicht"
        :temporary="istKleineAnsicht"
        :scrim="istKleineAnsicht"
        width="240"
      >
        <div class="navigation-logo">
          <span class="navigation-logo-icon">
            📚
          </span>

          <div>
            <strong>Mini-Bibliothek</strong>
            <small>Bücher entdecken</small>
          </div>
        </div>

        <div
          v-if="istKleineAnsicht"
          class="navigation-suche"
        >
          <v-text-field
            v-model="globalSearch"
            clearable
            density="compact"
            hide-details
            label="Bibliothek durchsuchen"
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            @click:clear="resetSearch"
            @keydown.esc="resetSearch"
            @keyup.enter="submitSearchUndSchliessen"
          />
        </div>

        <v-divider />

        <v-list
          density="comfortable"
          nav
          class="navigation-links"
        >
          <v-list-item
            prepend-icon="mdi-home-outline"
            title="Startseite"
            to="/"
            exact
            @click="navigationNachKlickSchliessen"
          />

          <v-list-item
            prepend-icon="mdi-bookshelf"
            title="Bibliothek"
            to="/bibliothek"
            @click="navigationNachKlickSchliessen"
          />

          <v-list-item
            prepend-icon="mdi-account-group-outline"
            title="Autoren"
            to="/autoren"
            @click="navigationNachKlickSchliessen"
          />
        </v-list>

        <template v-if="authStore.isLoggedIn">
          <v-divider class="navigation-divider" />

          <p class="navigation-ueberschrift">
            Mein Bereich
          </p>

          <v-list
            density="comfortable"
            nav
            class="navigation-links"
          >
            <v-list-item
              prepend-icon="mdi-heart-outline"
              title="Favoriten"
              to="/meine-buecher"
              @click="navigationNachKlickSchliessen"
            />

            <v-list-item
              prepend-icon="mdi-account-outline"
              title="Profil"
              to="/profil"
              @click="navigationNachKlickSchliessen"
            />
          </v-list>

          <div
            v-if="authStore.user"
            class="navigation-benutzer"
          >
            <v-avatar
              color="primary"
              size="42"
            >
              <span class="text-white font-weight-bold">
                {{ initials }}
              </span>
            </v-avatar>

            <div class="navigation-benutzer-text">
              <strong>
                {{ authStore.user.vorname }}
                {{ authStore.user.name }}
              </strong>

              <small>
                {{ authStore.user.email }}
              </small>
            </div>
          </div>

          <v-btn
            block
            variant="text"
            prepend-icon="mdi-logout"
            class="navigation-logout"
            @click="handleLogout"
          >
            Abmelden
          </v-btn>
        </template>

        <template v-else>
          <v-divider class="navigation-divider" />

          <div class="navigation-gast">
            <p>
              Melde dich an, um Favoriten zu speichern und
              Bücher zu bewerten.
            </p>

            <v-btn
              block
              to="/login"
              class="navigation-login"
              @click="navigationNachKlickSchliessen"
            >
              Anmelden
            </v-btn>

            <v-btn
              block
              to="/register"
              variant="outlined"
              class="navigation-register"
              @click="navigationNachKlickSchliessen"
            >
              Registrieren
            </v-btn>
          </div>
        </template>
      </v-navigation-drawer>

      <v-main class="hauptinhalt">
        <Toast ref="toastRef" />
        <router-view />
      </v-main>

      <v-footer
        app
        color="surface"
        class="app-footer"
      >
        <div class="footer-inner">
          <div class="footer-brand">
            <span class="footer-logo">
              📚
            </span>

            <div>
              <strong>Mini-Bibliothek</strong>

              <small>
                Bücher entdecken und Lieblingsgeschichten sammeln
              </small>
            </div>
          </div>

          <nav
            class="footer-navigation"
            aria-label="Footer-Navigation"
          >
            <router-link to="/">
              Startseite
            </router-link>

            <router-link to="/bibliothek">
              Bibliothek
            </router-link>

            <router-link to="/autoren">
              Autoren
            </router-link>
          </nav>

          <p class="footer-copyright">
            © {{ aktuellesJahr }} Mini-Bibliothek
          </p>
        </div>
      </v-footer>
    </v-app>
  </v-layout>
</template>

<script lang="ts" setup>
import {
  computed,
  onMounted,
  provide,
  ref,
  watch,
} from "vue";
import {
  useRoute,
  useRouter,
} from "vue-router";
import {
  useDisplay,
  useTheme,
} from "vuetify";
import Toast from "@/components/Toast.vue";
import { useAuthStore } from "@/stores/authStore";

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const theme = useTheme();
const { smAndDown } = useDisplay();

const istKleineAnsicht = smAndDown;
const navigationOffen = ref(
  !istKleineAnsicht.value
);

const globalSearch = ref("");
const aktuellesJahr = new Date().getFullYear();

const toastRef = ref<InstanceType<typeof Toast> | null>(
  null
);

provide("toast", toastRef);

const isDark = computed(() => {
  return theme.global.current.value.dark;
});

const initials = computed(() => {
  if (!authStore.user) {
    return "";
  }

  const ersterBuchstabeVorname =
    authStore.user.vorname?.charAt(0) || "";

  const ersterBuchstabeNachname =
    authStore.user.name?.charAt(0) || "";

  return (
    ersterBuchstabeVorname +
    ersterBuchstabeNachname
  ).toUpperCase();
});

watch(
  istKleineAnsicht,
  (kleineAnsichtIstAktiv) => {
    navigationOffen.value =
      !kleineAnsichtIstAktiv;
  }
);

watch(
  () => route.query.q,
  (suchbegriff) => {
    if (typeof suchbegriff === "string") {
      globalSearch.value = suchbegriff;
      return;
    }

    globalSearch.value = "";
  },
  {
    immediate: true,
  }
);

watch(globalSearch, (neuerWert) => {
  const suchbegriffIstLeer =
    typeof neuerWert === "string" &&
    neuerWert.trim() === "";

  const bibliothekIstGeoeffnet =
    route.path.startsWith("/bibliothek");

  const queryIstVorhanden =
    route.query.q != null;

  if (
    suchbegriffIstLeer &&
    bibliothekIstGeoeffnet &&
    queryIstVorhanden
  ) {
    router.replace({
      path: "/bibliothek",
    });
  }
});

function toggleDarkMode(): void {
  if (isDark.value) {
    theme.global.name.value = "meineFarben";
  } else {
    theme.global.name.value = "dark";
  }

  localStorage.setItem(
    "darkMode",
    theme.global.name.value
  );
}

function navigationNachKlickSchliessen(): void {
  if (istKleineAnsicht.value) {
    navigationOffen.value = false;
  }
}

function handleLogout(): void {
  authStore.logout();
  navigationNachKlickSchliessen();
  router.push("/");
}

function submitSearch(): void {
  const suchbegriff = globalSearch.value.trim();

  if (suchbegriff === "") {
    router.push({
      path: "/bibliothek",
    });

    return;
  }

  router.push({
    path: "/bibliothek",
    query: {
      q: suchbegriff,
    },
  });
}

function submitSearchUndSchliessen(): void {
  submitSearch();
  navigationNachKlickSchliessen();
}

function resetSearch(): void {
  globalSearch.value = "";

  const bibliothekIstGeoeffnet =
    route.path.startsWith("/bibliothek");

  const queryIstVorhanden =
    route.query.q != null;

  if (
    bibliothekIstGeoeffnet &&
    queryIstVorhanden
  ) {
    router.replace({
      path: "/bibliothek",
    });
  }
}

onMounted(async () => {
  const gespeichertesTheme =
    localStorage.getItem("darkMode");

  theme.global.name.value =
    gespeichertesTheme || "meineFarben";

  if (authStore.isLoggedIn) {
    await authStore.fetchMe();
  }
});
</script>

<style scoped>
:global(html),
:global(body),
:global(#app) {
  max-width: 100%;
  overflow-x: hidden;
}

.appbar-title {
  min-width: 0;
  max-width: 320px;
  flex: 0 1 auto;
  padding-left: 16px;
  white-space: nowrap;
}

.appbar-title :deep(.v-toolbar-title__placeholder) {
  overflow: hidden;
  text-overflow: ellipsis;
}

.titel-kurz {
  display: none;
}

.appbar-center {
  display: flex;
  min-width: 0;
  flex: 1 1 420px;
  justify-content: center;
  padding: 0 12px;
}

.appbar-search {
  width: min(100%, 700px);
}

.appbar-right {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 10px;
  padding-right: 8px;
}

.topbar-benutzer {
  overflow: hidden;
  max-width: 210px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.topbar-auth {
  display: flex;
  align-items: center;
  gap: 8px;
}

.topbar-link,
.topbar-register {
  text-transform: none;
}

.topbar-register {
  border-radius: 10px;
}

.hauptnavigation {
  border-right: 1px solid
    rgb(var(--v-theme-cardBorder));
}

.hauptinhalt {
  min-width: 0;
  overflow-x: hidden;
}

:deep(.v-app-bar) {
  border-bottom: 1px solid
    rgb(var(--v-theme-cardBorder));
}

.navigation-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 22px 18px;
}

.navigation-logo-icon {
  display: flex;
  width: 42px;
  height: 42px;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  background: rgba(
    var(--v-theme-primary),
    0.18
  );
  font-size: 1.35rem;
}

.navigation-logo strong {
  display: block;
  font-size: 0.98rem;
}

.navigation-logo small {
  display: block;
  margin-top: 2px;
  color: rgb(var(--v-theme-textMuted));
  font-size: 0.74rem;
}

.navigation-suche {
  padding: 0 14px 16px;
}

.navigation-links {
  padding: 12px;
}

.navigation-links :deep(.v-list-item) {
  min-height: 46px;
  margin-bottom: 5px;
  border-radius: 13px;
}

.navigation-links :deep(.v-list-item--active) {
  background: rgba(
    var(--v-theme-primary),
    0.18
  );
}

.navigation-divider {
  margin: 12px 16px;
}

.navigation-ueberschrift {
  margin: 18px 20px 6px;
  color: rgb(var(--v-theme-textMuted));
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.navigation-benutzer {
  display: flex;
  gap: 12px;
  align-items: center;
  margin: 18px 14px 10px;
  padding: 14px;
  border-radius: 16px;
  background: rgb(
    var(--v-theme-softSurface)
  );
}

.navigation-benutzer-text {
  min-width: 0;
}

.navigation-benutzer-text strong,
.navigation-benutzer-text small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.navigation-benutzer-text strong {
  font-size: 0.84rem;
}

.navigation-benutzer-text small {
  margin-top: 3px;
  color: rgb(var(--v-theme-textMuted));
  font-size: 0.7rem;
}

.navigation-logout {
  width: calc(100% - 28px);
  margin: 4px 14px 16px;
  justify-content: flex-start;
  text-transform: none;
}

.navigation-gast {
  padding: 14px;
}

.navigation-gast p {
  margin-bottom: 16px;
  color: rgb(var(--v-theme-textMuted));
  font-size: 0.82rem;
  line-height: 1.55;
}

.navigation-login,
.navigation-register {
  margin-bottom: 10px;
  border-radius: 12px;
  text-transform: none;
}

.navigation-login {
  background: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
}

.app-footer {
  padding: 0 !important;
  border-top: 1px solid
    rgb(var(--v-theme-cardBorder));
  background: rgb(
    var(--v-theme-surface)
  ) !important;
  color: rgb(var(--v-theme-textPrimary));
}

.footer-inner {
  display: grid;
  width: 100%;
  min-width: 0;
  min-height: 90px;
  grid-template-columns:
    minmax(0, 1fr)
    auto
    auto;
  gap: 36px;
  align-items: center;
  padding:
    24px
    clamp(22px, 4vw, 64px);
}

.footer-brand {
  display: flex;
  min-width: 0;
  gap: 12px;
  align-items: center;
}

.footer-logo {
  display: flex;
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  align-items: center;
  justify-content: center;
  border-radius: 13px;
  background: rgb(
    var(--v-theme-softSurface)
  );
  font-size: 1.25rem;
}

.footer-brand strong,
.footer-brand small {
  display: block;
}

.footer-brand strong {
  color: rgb(var(--v-theme-textPrimary));
  font-size: 0.95rem;
}

.footer-brand small {
  margin-top: 3px;
  color: rgb(var(--v-theme-textMuted));
  font-size: 0.75rem;
}

.footer-navigation {
  display: flex;
  gap: 22px;
}

.footer-navigation a {
  color: rgb(var(--v-theme-textMuted));
  font-size: 0.82rem;
  font-weight: 600;
  text-decoration: none;
  transition: color 160ms ease;
}

.footer-navigation a:hover {
  color: rgb(var(--v-theme-primary));
}

.footer-copyright {
  margin: 0;
  color: rgb(var(--v-theme-textMuted));
  font-size: 0.78rem;
  white-space: nowrap;
}

@media (max-width: 1100px) {
  .topbar-benutzer {
    display: none;
  }

  .appbar-title {
    max-width: 250px;
  }
}

@media (max-width: 960px) {
  .appbar-title {
    max-width: none;
    flex: 1 1 auto;
    padding-left: 0;
  }

  .appbar-center {
    display: none;
  }

  .appbar-right {
    margin-left: auto;
    gap: 4px;
  }

  .footer-inner {
    grid-template-columns: 1fr;
    gap: 18px;
    text-align: center;
  }

  .footer-brand,
  .footer-navigation {
    justify-content: center;
  }

  .footer-navigation {
    flex-wrap: wrap;
  }
}

@media (max-width: 520px) {
  .titel-voll {
    display: none;
  }

  .titel-kurz {
    display: inline;
  }

  .appbar-title {
    font-size: 1rem;
  }

  .footer-inner {
    padding: 24px 18px;
  }

  .footer-brand small {
    max-width: 230px;
    white-space: normal;
  }
}
</style>
