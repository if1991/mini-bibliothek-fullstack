const mongoose = require('mongoose');
const Buch = require('../models/Buch.js'); 
require('dotenv').config();


const migrateBooks = async () => {
  try {
   
    console.log('Verbinde mit der Datenbank...');
    await mongoose.connect(process.env.MONGO_URI, { 
      useUnifiedTopology: true,
    });
    console.log('Erfolgreich mit der Datenbank verbunden.');


    const buecherZuMigrieren = await Buch.find({ "titel": { "$type": "string" } });
    
    if (buecherZuMigrieren.length === 0) {
      console.log('Keine Bücher zum Migrieren gefunden. Alles ist bereits auf dem neuesten Stand.');
      return;
    }

    console.log(`Migration wird für ${buecherZuMigrieren.length} Bücher gestartet...`);
    let count = 0;

    for (const buch of buecherZuMigrieren) {
      const alterTitel = buch.titel;
      const alterAutor = buch.autor;

      
      buch.titel = {
        de: alterTitel,
        en: alterTitel,
        zh: alterTitel,
      };

      buch.autor = {
        de: alterAutor,
        en: alterAutor,
        zh: alterAutor,
      };
      
     
      await buch.save();
      count++;
      console.log(`(${count}/${buecherZuMigrieren.length}) Buch "${alterTitel}" erfolgreich migriert.`);
    }

    console.log(' Alle Bücher wurden erfolgreich migriert!');

  } catch (error) {
    console.error('Ein Fehler ist während der Migration aufgetreten:', error);
  } finally {
    
    await mongoose.connection.close();
    console.log('Datenbankverbindung geschlossen.');
  }
};


migrateBooks();