// eslint.config.js
import vuetify from "eslint-config-vuetify";

export default vuetify(
  {
    // Hier ist unser neuer Block für benutzerdefinierte Regeln
    rules: {
      "vuetify/no-legacy-grid": "off", // Schaltet die Vuetify Grid-Regel aus
      "@stylistic/max-len": "off", // Schaltet die "Zeile ist zu lang"-Regel aus
      "@stylistic/quotes": "off", // Erlaubt sowohl ' als auch " Anführungszeichen
      "@stylistic/semi": "off", // Erlaubt Code mit und ohne Semikolons
      "@stylistic/eol-last": "off", // Erlaubt Dateien, die nicht mit einer Leerzeile enden
    },
    // eslint-disable-next-line @stylistic/comma-dangle
  }
  // true // Diese Option könntest du hinzufügen, wenn du auch 'stylistic' Regeln aktivieren wolltest
);
