\# 📚 Mini-Bibliothek



Eine responsive Fullstack-Webanwendung zur Verwaltung, Suche und Bewertung von Büchern.



Die Mini-Bibliothek ermöglicht es Gästen, die vorhandene Büchersammlung und Autoren zu durchsuchen. Registrierte Nutzer können persönliche Favoriten speichern und Bücher bewerten. Administratoren besitzen zusätzlich Funktionen zur Verwaltung und Erweiterung des Buchbestands.



Das Projekt wurde mit Vue 3, TypeScript, GraphQL, Node.js und MongoDB umgesetzt.



\---



\## ✨ Funktionen



\### Für Gäste



\* Öffentliche Startseite

\* Bücherübersicht mit Suche

\* Autorenübersicht und Autorendetails

\* Anzeige von Buchinformationen und Bewertungen

\* Suche nach Büchern über Open Library

\* Responsive Darstellung für Desktop, Tablet und Smartphone

\* Heller und dunkler Darstellungsmodus



\### Für registrierte Nutzer



\* Registrierung und Anmeldung

\* Persönliches Benutzerprofil

\* Bücher als Favoriten speichern

\* Favoriten wieder entfernen

\* Eigene Favoritenübersicht

\* Bücher mit Sternen bewerten

\* Dauerhafte Speicherung der Nutzerdaten



\### Für Administratoren



\* Bücher manuell hinzufügen

\* Bücher aus Open Library in die eigene Datenbank übernehmen

\* Automatische Zuordnung beziehungsweise Erstellung von Autoren

\* Bücher aus dem Bestand löschen

\* Schutz vor doppeltem Import

\* Serverseitige Prüfung der Administratorrolle



\---



\## 🛠️ Verwendete Technologien



\### Frontend



\* Vue 3

\* TypeScript

\* Pinia

\* Vuetify

\* Vue Router

\* Vite



\### Backend



\* Node.js

\* TypeScript

\* Apollo Server

\* GraphQL

\* Express

\* Mongoose

\* JSON Web Tokens



\### Datenbank und externe Dienste



\* MongoDB Atlas

\* Open Library API



\---



\## 🔐 Authentifizierung und Rollen



Die Anwendung verwendet JSON Web Tokens zur Authentifizierung.



Es gibt zwei Benutzerrollen:



\* `USER`

\* `ADMIN`



Sicherheitsrelevante Berechtigungen werden nicht nur im Frontend ausgeblendet, sondern zusätzlich im Backend überprüft. Dadurch können administrative Mutationen nicht allein durch manipulierte Frontend-Anfragen ausgeführt werden.



Passwörter werden nicht im Klartext gespeichert. Zugangsdaten, Datenbankverbindungen und JWT-Secrets werden über Umgebungsvariablen eingebunden und nicht im Repository veröffentlicht.



\---



\## 🎨 Benutzeroberfläche



Die Benutzeroberfläche wurde mit Vuetify umgesetzt und besitzt ein eigenes responsives Design.



Zu den gestalterischen Funktionen gehören:



\* Light- und Dark-Mode

\* Responsive Navigation mit mobilem Menü

\* Kartenansichten für Bücher und Autoren

\* Detaildialoge für Bücher

\* Eigene Favoritenseite

\* Benutzerprofil

\* Angepasste Darstellung für kleine Bildschirme



\---



\## 📁 Projektstruktur



```text

mini-bibliothek-fullstack/

├── bibliothek\_backend/

│   ├── graphql/

│   ├── scalars/

│   ├── scripts/

│   └── src/

│       ├── models/

│       ├── resolvers/

│       └── services/

│

├── mini-bibliothek/

│   ├── public/

│   └── src/

│       ├── components/

│       ├── layouts/

│       ├── pages/

│       ├── plugins/

│       ├── stores/

│       ├── styles/

│       └── types/

│

└── README.md

```



\---



\## 🚀 Lokale Installation



\### Voraussetzungen



Für den lokalen Betrieb werden benötigt:



\* Node.js

\* npm

\* eine MongoDB-Datenbank

\* ein eigener JWT-Schlüssel



\### Repository herunterladen



```bash

git clone https://github.com/if1991/mini-bibliothek-fullstack.git

cd mini-bibliothek-fullstack

```



\### Backend einrichten



```bash

cd bibliothek\_backend

npm install

```



Im Ordner `bibliothek\_backend` muss eine Datei namens `.env` angelegt werden:



```env

MONGO\_URI=deine\_mongodb\_verbindungsadresse

PORT=4000

JWT\_SECRET=dein\_sicherer\_jwt\_schluessel

```



Backend starten:



```bash

npm run dev

```



Das lokale GraphQL-Backend ist anschließend standardmäßig unter folgender Adresse erreichbar:



```text

http://localhost:4000/graphql

```



\### Frontend einrichten



In einem zweiten Terminal:



```bash

cd mini-bibliothek

npm install

npm run dev

```



\---



\## 🧪 Getestete Benutzerrollen



Die Anwendung wurde mit drei unterschiedlichen Zugriffsebenen getestet:



| Rolle         | Möglichkeiten                              |

| ------------- | ------------------------------------------ |

| Gast          | Bücher und Autoren ansehen sowie suchen    |

| Nutzer        | Favoriten speichern und Bücher bewerten    |

| Administrator | Bücher importieren, hinzufügen und löschen |



Administrative Aktionen werden zusätzlich serverseitig abgesichert.



\---



\## 🌐 Live-Demo



Eine öffentlich erreichbare Live-Version wird ergänzt, sobald Frontend und Backend vollständig veröffentlicht wurden.



\---



\## 📸 Screenshots



Screenshots und weitere Einblicke in die Anwendung werden mit der Veröffentlichung der Live-Demo ergänzt.



\---



\## 💡 Hintergrund



Die Mini-Bibliothek entstand ursprünglich während eines Praktikums und wurde anschließend technisch sowie gestalterisch umfassend überarbeitet.



Dabei wurden unter anderem folgende Bereiche modernisiert:



\* Benutzeroberfläche und responsives Design

\* Rollen- und Berechtigungssystem

\* Authentifizierung

\* Favoriten und Bewertungen

\* Open-Library-Anbindung

\* Datenmodelle und TypeScript-Typen

\* mobile Navigation

\* Light- und Dark-Mode

\* Sicherheitskonfiguration für eine öffentliche Veröffentlichung



\---



\## 👩‍💻 Entwicklerin



Entwickelt als Fullstack-Portfolio-Projekt von \*\*Inga Faber\*\*.



\---



\## 📄 Hinweis



Dieses Projekt dient der Demonstration eigener Kenntnisse in der Fullstack-Webentwicklung. Die in einer Demo verwendeten Namen, E-Mail-Adressen und Buchdaten können zu Testzwecken angelegt worden sein.



