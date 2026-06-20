export interface OeffentlichesBuch {
  openLibraryKey: string;
  titel: string;
  autorName: string;
  erscheinungsjahr?: number;
  coverBild?: string;
}

interface OpenLibraryDokument {
  key?: string;
  title?: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number;
}

interface OpenLibraryAntwort {
  docs?: OpenLibraryDokument[];
}

export async function sucheBuecherBeiOpenLibrary(
  suchbegriff: string
): Promise<OeffentlichesBuch[]> {
  const bereinigterSuchbegriff = suchbegriff.trim();

  if (bereinigterSuchbegriff.length < 2) {
    return [];
  }

  const parameter = new URLSearchParams({
    q: bereinigterSuchbegriff,
    limit: "20",
    fields: "key,title,author_name,first_publish_year,cover_i",
  });

  const url =
    "https://openlibrary.org/search.json?" + parameter.toString();

  const antwort = await fetch(url);

  if (!antwort.ok) {
    throw new Error(
      "Open Library konnte nicht erreicht werden. Status: " +
        antwort.status
    );
  }

  const daten = (await antwort.json()) as OpenLibraryAntwort;
  const dokumente = daten.docs ?? [];
  const ergebnisse: OeffentlichesBuch[] = [];

  for (const dokument of dokumente) {
    if (!dokument.key) {
      continue;
    }

    if (!dokument.title) {
      continue;
    }

    if (!dokument.author_name || dokument.author_name.length === 0) {
      continue;
    }

    let coverBild: string | undefined;

    if (dokument.cover_i) {
      coverBild =
        "https://covers.openlibrary.org/b/id/" +
        dokument.cover_i +
        "-M.jpg";
    }

    ergebnisse.push({
      openLibraryKey: dokument.key,
      titel: dokument.title,
      autorName: dokument.author_name[0],
      erscheinungsjahr: dokument.first_publish_year,
      coverBild,
    });
  }

  return ergebnisse;
}