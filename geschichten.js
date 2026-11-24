/*
  HIER TRÄGST DU ALLES EIN.

  Jede Geschichte ist ein Block zwischen { und }.
  Die Reihenfolge hier ist die Reihenfolge im Regal.

  audio:         Dateiname der Aufnahme im Ordner "audio", z. B. "audio/01-keller.m4a".
                 Solange hier "" steht, zeigt das Regal die Geschichte als "Bald".
  bild:          Dateiname des Covers im Ordner "bilder". Ohne Bild erscheint nur die Farbe.
  datum:         Das Datum, das an der Folge steht, z. B. "05.12.2026".
  beschreibung:  Die Folgenbeschreibung. Absätze mit \n\n trennen.
  mitDabei:      Wer in der Folge vorkommt.
  sichtbarAb:    Optional. Vor diesem Datum ist die Geschichte komplett unsichtbar.
  kapitel:       Optional. Liste aus ["Kapitelname", "Minute:Sekunde"].

  Zum Testen alles sehen: an die Adresse ?vorschau anhängen.
*/

window.REGAL = {
  // So viele leere Plätze zeigt das Regal am Ende als "kommt noch"
  freiePlaetze: 2
};

window.GESCHICHTEN = [
  {
    nr: "01",
    titel: "Der Keller von Montzen",
    genre: "Thriller",
    datum: "05.12.2026",
    dauer: "18 Min.",
    farbe: "#E8452C",
    schrift: "#0E0E0E",
    bild: "bilder/01-keller.jpg",
    audio: "audio/01-keller.m4a",
    beschreibung:
      "Themenabend in Montzen, das Land des Abends ist Frankreich. Der Tisch ist voll, der Wein ist gut, und Danny hat eine Überraschung für seine Freunde. Doch der Abend läuft anders als geplant.",
    mitDabei: ["Danny", "Gina", "Göran", "Nicolas", "Alice", "Sven", "Claudia", "Svenja", "Thomas"],
    kapitel: [
      ["Ein ganz normaler Themenabend", "0:59"],
      ["Die Flasche", "4:47"],
      ["Der Abend nimmt seinen Lauf", "7:44"],
      ["Der leere Platz", "9:10"],
      ["Der Kommissar erwacht", "11:42"],
      ["Die Auflösung", "14:37"],
      ["Epilog", "16:53"]
    ]
  },
  {
    nr: "02",
    titel: "Leppak macht’s",
    genre: "Abenteuer",
    datum: "05.12.2026",
    dauer: "18 Min.",
    farbe: "#1F3D5C",
    schrift: "#ECEAE4",
    bild: "bilder/02-tapete.jpg",
    audio: "audio/02-leppak.m4a",
    beschreibung:
      "Eigentlich ist es ein ganz normaler Auftrag: alte Tapete runter, neu streichen. Doch die alte Villa in Kelmis hat mehr zu erzählen, als Danny und Mano ahnen. Ein Fall für Leppak macht’s.",
    mitDabei: ["Danny", "Mano", "Gina", "Svenja", "Mario", "Magalie", "Hendrik", "Theo", "Nicolas", "Dieter"],
    kapitel: [
      ["Dies, das, Ananas", "0:57"],
      ["Die Villa mit den drei Tapeten", "3:31"],
      ["Ein Land, das es nicht mehr gibt", "6:13"],
      ["Am Küchentisch", "7:47"],
      ["Wo vier Länder sich die Hand geben", "9:54"],
      ["Am Casinoweiher", "12:27"],
      ["Das Wertvollste von Neutral-Moresnet", "14:20"],
      ["Epilog", "16:34"]
    ]
  },
  {
    nr: "03",
    titel: "Die Nacht der Bockwürste",
    genre: "Komödie",
    datum: "05.12.2026",
    dauer: "25 Min.",
    farbe: "#F2B544",
    schrift: "#0E0E0E",
    bild: "bilder/03-bockwurst.jpg",
    audio: "audio/03-bockwurst.m4a",
    beschreibung:
      "Karnevalssamstag in Kelmis. Im Plattweg treffen sich die Stars der Achtziger, Danny hat eine Überraschung in der Garage versteckt, und Alice freut sich schon auf ihre Bockwürstchen. Doch mitten in der Nacht ist plötzlich etwas verschwunden.",
    mitDabei: ["Danny", "Gina", "Svenja", "Thomas", "Alice", "Sven", "Franz", "Claudia", "Nicolas", "Göran", "Veronique"],
    kapitel: [
      ["Vorglühen im Plattweg", "0:53"],
      ["Die Garage", "6:12"],
      ["Kölle goes Kenehemo", "9:27"],
      ["Die leere Garage", "13:37"],
      ["Die Jagd", "16:09"],
      ["Schneewittchen", "18:51"],
      ["Epilog", "22:38"]
    ]
  },
  {
    nr: "04",
    titel: "Ein Tisch für zwei",
    genre: "Romantik",
    datum: "05.12.2026",
    dauer: "",
    farbe: "#C9B8E8",
    schrift: "#0E0E0E",
    bild: "",
    audio: "",
    beschreibung: "",
    mitDabei: [],
    kapitel: []
  },
  {
    nr: "05",
    titel: "Die Leppaka’s von Montzen",
    genre: "Grusel",
    datum: "05.12.2026",
    dauer: "",
    farbe: "#2A2A2A",
    schrift: "#ECEAE4",
    bild: "",
    audio: "",
    beschreibung: "",
    mitDabei: [],
    kapitel: []
  },
  {
    nr: "06",
    titel: "Das Weihnachts-Special",
    genre: "Für Romy, Loïc und Gina",
    datum: "24.12.2026",
    dauer: "",
    farbe: "#2F6B4F",
    schrift: "#ECEAE4",
    bild: "",
    audio: "",
    beschreibung: "",
    mitDabei: [],
    kapitel: [],
    sichtbarAb: "2026-12-24"
  }
];
