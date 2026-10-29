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
    audio: "",
    beschreibung:
      "Themenabend in Montzen, das Land des Abends ist Frankreich. Der Tisch ist voll, der Wein ist gut, und Danny hat eine Überraschung für seine Freunde. Doch der Abend läuft anders als geplant.",
    mitDabei: ["Danny", "Gina", "Göran", "Nicolas", "Alice", "Sven", "Claudia", "Svenja", "Thomas"],
    kapitel: [
      ["Ein ganz normaler Themenabend", "1:01"],
      ["Die Flasche", "4:47"],
      ["Der Abend nimmt seinen Lauf", "7:46"],
      ["Der leere Platz", "9:15"],
      ["Der Kommissar erwacht", "11:44"],
      ["Die Auflösung", "14:51"],
      ["Epilog", "17:03"]
    ]
  },
  {
    nr: "02",
    titel: "Leppak macht’s",
    genre: "Abenteuer",
    datum: "05.12.2026",
    dauer: "",
    farbe: "#1F3D5C",
    schrift: "#ECEAE4",
    bild: "bilder/02-tapete.jpg",
    audio: "",
    beschreibung:
      "Eigentlich ist es ein ganz normaler Auftrag: alte Tapete runter, neu streichen. Doch die alte Villa in Kelmis hat mehr zu erzählen, als Danny und Mano ahnen. Ein Fall für Leppak macht’s.",
    mitDabei: ["Danny", "Mano", "Gina", "Svenja", "Mario", "Magali", "Hendrik", "Theo", "Nicolas", "Dieter"],
    kapitel: []
  },
  {
    nr: "03",
    titel: "Die Nacht der Bockwürste",
    genre: "Komödie",
    datum: "05.12.2026",
    dauer: "",
    farbe: "#F2B544",
    schrift: "#0E0E0E",
    bild: "",
    audio: "",
    beschreibung: "",
    mitDabei: [],
    kapitel: []
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
