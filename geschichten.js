/*
  HIER TRÄGST DU ALLES EIN.

  Jede Geschichte ist ein Block zwischen { und }.
  Die Reihenfolge hier ist die Reihenfolge im Regal.

  audio:       Dateiname der Aufnahme im Ordner "audio", z. B. "audio/01-keller.m4a".
               Solange hier "" steht, zeigt das Regal die Geschichte als "Bald".
  bild:        Dateiname des Covers im Ordner "bilder". Ohne Bild erscheint nur die Farbe.
  sichtbarAb:  Optional. Vor diesem Datum ist die Geschichte komplett unsichtbar.
  kapitel:     Optional. Liste aus ["Kapitelname", "Minute:Sekunde"].

  Zum Testen alles sehen: an die Adresse ?vorschau anhängen.
*/

window.GESCHICHTEN = [
  {
    nr: "01",
    titel: "Der Keller von Montzen",
    genre: "Thriller",
    dauer: "ca. 14 Min.",
    farbe: "#E8452C",
    schrift: "#0E0E0E",
    bild: "bilder/01-keller.jpg",
    audio: "",
    kapitel: []
  },
  {
    nr: "02",
    titel: "Leppak macht’s",
    genre: "Abenteuer",
    dauer: "",
    farbe: "#1F3D5C",
    schrift: "#ECEAE4",
    bild: "",
    audio: "",
    kapitel: []
  },
  {
    nr: "03",
    titel: "Die Nacht der Bockwürste",
    genre: "Komödie",
    dauer: "",
    farbe: "#F2B544",
    schrift: "#0E0E0E",
    bild: "",
    audio: "",
    kapitel: []
  },
  {
    nr: "04",
    titel: "Ein Tisch für zwei",
    genre: "Romantik",
    dauer: "",
    farbe: "#C9B8E8",
    schrift: "#0E0E0E",
    bild: "",
    audio: "",
    kapitel: []
  },
  {
    nr: "05",
    titel: "Die Leppaka’s von Montzen",
    genre: "Grusel",
    dauer: "",
    farbe: "#2A2A2A",
    schrift: "#ECEAE4",
    bild: "",
    audio: "",
    kapitel: []
  },
  {
    nr: "06",
    titel: "Das Weihnachts-Special",
    genre: "Für Romi, Loik und Gina",
    dauer: "",
    farbe: "#2F6B4F",
    schrift: "#ECEAE4",
    bild: "",
    audio: "",
    kapitel: [],
    sichtbarAb: "2026-12-24"
  }
];
