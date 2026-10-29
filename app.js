(function () {
  'use strict';

  var app = document.getElementById('app');
  var mini = document.getElementById('mini');
  var audio = document.getElementById('audio');
  var VORSCHAU = /[?&]vorschau/.test(location.search) || window.HR_VORSCHAU === true;
  var BALKEN = 48;

  var SPEICHER = {
    lesen: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    schreiben: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
    loeschen: function (k) { try { localStorage.removeItem(k); } catch (e) {} }
  };

  var schlafStufen = [0, 10, 20, 30, -1];
  var tempoStufen = [1, 1.25, 0.85];
  var zustand = { aktuell: null, schlaf: 0, schlafTimer: null, tempo: 0, letzteSicherung: 0, filter: 'alle', seite: 'regal', langText: false };

  function heute() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function sichtbar() {
    return (window.GESCHICHTEN || []).filter(function (g) {
      return VORSCHAU || (hoerbar(g) && (!g.sichtbarAb || heute() >= g.sichtbarAb));
    });
  }

  function hoerbar(g) { return !!(g.audio && g.audio.trim()); }
  function oeffenbar(g) { return true; }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function zeit(sek) {
    if (!isFinite(sek) || sek < 0) sek = 0;
    var m = Math.floor(sek / 60), s = Math.floor(sek % 60);
    return m + ':' + String(s).padStart(2, '0');
  }

  function sekunden(text) {
    var t = String(text || '0').split(':').map(Number);
    return t.length === 3 ? t[0] * 3600 + t[1] * 60 + t[2] : (t[0] || 0) * 60 + (t[1] || 0);
  }

  function position(g) { return parseFloat(SPEICHER.lesen('hr-pos-' + g.nr)) || 0; }
  function dauerGemerkt(g) { return parseFloat(SPEICHER.lesen('hr-dauer-' + g.nr)) || 0; }
  function gehoert(g) { return SPEICHER.lesen('hr-fertig-' + g.nr) === '1'; }
  function gemerkt(g) { return SPEICHER.lesen('hr-herz-' + g.nr) === '1'; }
  function anteil(g) {
    if (gehoert(g)) return 100;
    var d = dauerGemerkt(g), p = position(g);
    return d && p ? Math.min(100, p / d * 100) : 0;
  }

  function link(g) { return (window.HR_VORSCHAU ? '#f' : '#/') + g.nr; }

  function naechste(g) {
    var l = sichtbar(), i = l.indexOf(g);
    return i >= 0 ? l[i + 1] || null : null;
  }

  var ICON = {
    play: '<svg aria-hidden="true" width="26" height="26" viewBox="0 0 26 26"><path d="M8 4 L22 13 L8 22 Z" fill="currentColor"/></svg>',
    pause: '<svg aria-hidden="true" width="26" height="26" viewBox="0 0 26 26"><rect x="6" y="4" width="5" height="18" rx="1" fill="currentColor"/><rect x="15" y="4" width="5" height="18" rx="1" fill="currentColor"/></svg>',
    zurueck: '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 3 L5 9 L11 15"/></svg>',
    herz: '<svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20"><path d="M10 17.2 L3.2 10.6 A4.1 4.1 0 0 1 10 4.9 A4.1 4.1 0 0 1 16.8 10.6 Z" fill="var(--herz-fill, none)" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
    haken: '<svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 6.5 L5 9 L10 3"/></svg>',
    pfeil: '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 3 L13 9 L7 15"/></svg>'
  };

  /* ---------- Startseite ---------- */

  function zeigeRegal() {
    zustand.seite = 'regal';
    document.body.classList.remove('dunkel');
    document.title = 'Hörregal';
    var liste = sichtbar();
    var verfuegbar = liste.filter(hoerbar);

    var zuletzt = SPEICHER.lesen('hr-zuletzt');
    // Große Karte: 1. zuletzt geöffnete Folge (wenn nicht fertig gehört), 2. nächste ungehörte Folge, 3. neueste Folge
    var letzte = liste.filter(function (g) { return g.nr === zuletzt; })[0];
    var haupt = (letzte && (hoerbar(letzte) || VORSCHAU) && !gehoert(letzte) ? letzte : null)
      || liste.filter(function (g) { return !gehoert(g) && (hoerbar(g) || VORSCHAU); })[0]
      || verfuegbar[verfuegbar.length - 1]
      || liste[0];

    var herzen = liste.filter(gemerkt).length;
    var neu = verfuegbar.filter(function (g) { return !gehoert(g); }).length;

    var html = '<div class="seite">' +
      '<header class="kopf"><div><p>Bärchi’s</p><h1>Hör<br>regal.</h1></div>' +
      (verfuegbar.length ? '<span class="zaehler">Folge ' + esc(verfuegbar[verfuegbar.length - 1].nr) + '</span>' : '') + '</header>' +
      '<p class="intro">Geschichten aus Ostbelgien. Eingesprochen von Svenja.</p>';

    var offen = liste.filter(function (g) { return g.nr === zustand.offen; })[0] || haupt;

    html += '<div class="chips" role="group" aria-label="Folgen filtern">' +
      chip('alle', 'Alle') +
      chip('neu', 'Noch offen' + (neu ? ' · ' + neu : '')) +
      chip('herz', 'Favoriten' + (herzen ? ' · ' + herzen : '')) +
      '</div>';

    var rest = liste.filter(function (g) {
      if (zustand.filter === 'neu') return hoerbar(g) && !gehoert(g);
      if (zustand.filter === 'herz') return gemerkt(g);
      return true;
    });

    if (rest.length) {
      html += '<div class="liste">';
      rest.forEach(function (g) { html += g === offen ? hauptkarte(g) : zeile(g); });
      html += '</div>';
    } else {
      html += '<p class="leer">' + (zustand.filter === 'herz'
        ? 'Noch keine Favoriten. Tipp in einer Folge auf das Herz, dann landet sie hier.'
        : 'Alles gehört.') + '</p>';
    }

    html += '<section class="ende"><span class="licht" aria-hidden="true"></span><p class="tbc">Fortsetzung<br>folgt.</p><p class="ende-klein">Bleib dran, Bärchi.</p></section>';
    html += '</div>';

    app.innerHTML = html;

    Array.prototype.forEach.call(app.querySelectorAll('[data-filter]'), function (b) {
      b.onclick = function () { zustand.filter = b.getAttribute('data-filter'); zeigeRegal(); };
    });
    Array.prototype.forEach.call(app.querySelectorAll('.zeile[data-nr]'), function (z) {
      z.onclick = function (e) {
        e.preventDefault();
        zustand.offen = z.getAttribute('data-nr');
        zustand.aufklappen = true;
        SPEICHER.schreiben('hr-zuletzt', zustand.offen);
        zeigeRegal();
      };
    });
    var knopf = document.getElementById('haupt-play');
    if (knopf && offen) knopf.onclick = function (e) { e.preventDefault(); e.stopPropagation(); spieleAb(offen); };
    if (zustand.aufklappen) {
      zustand.aufklappen = false;
      var karte = app.querySelector('.hauptkarte');
      if (karte) {
        karte.classList.add('auf');
        var oben = karte.getBoundingClientRect().top;
        if (oben < 0 || oben > window.innerHeight * 0.45) karte.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
    miniZeigen();
  }

  function chip(wert, text) {
    return '<button type="button" class="chip" data-filter="' + wert + '" aria-pressed="' + (zustand.filter === wert) + '">' + esc(text) + '</button>';
  }

  function hauptkarte(g) {
    var pos = position(g);
    var marke = !hoerbar(g) ? 'Bald im Regal' : gehoert(g) ? 'Schon gehört' : pos > 5 ? 'Weiterhören ab ' + zeit(pos) : 'Neu im Regal';
    var a = anteil(g);
    var meta = ['Folge ' + g.nr, g.genre, hoerbar(g) ? g.dauer : null].filter(Boolean).join(' · ');
    var spielt = zustand.aktuell === g && !audio.paused;
    var kurz = g.beschreibung ? g.beschreibung.split('\n\n')[0] : '';
    return '<article class="hauptkarte">' +
      '<a class="bildflaeche" href="' + link(g) + '" aria-label="' + esc(g.titel) + ' öffnen" style="background:' + esc(g.farbe) + '">' +
        (g.bild ? '<img src="' + esc(g.bild) + '" alt="">' : '') +
        '<span class="marke">' + esc(marke) + '</span>' +
        '<span class="nummer" style="color:' + (g.bild ? 'var(--paper)' : esc(g.schrift)) + '">' + esc(g.nr) + '</span>' +
      '</a>' +
      (a ? '<div class="fortschritt"><span style="width:' + a.toFixed(1) + '%"></span></div>' : '') +
      '<div class="unten"><div class="texte"><p class="meta">' + esc(meta) + '</p><h2>' + esc(g.titel) + '</h2></div>' +
        (hoerbar(g) ? '<button type="button" class="playrund" id="haupt-play" data-nr="' + esc(g.nr) + '" aria-label="' + (spielt ? 'Pause' : 'Abspielen') + '" style="color:var(--ink)">' + (spielt ? ICON.pause : ICON.play) + '</button>' : '') +
      '</div>' +
      (kurz ? '<p class="hk-kurz">' + esc(kurz) + '</p>' : '') +
      '<a class="hk-link" href="' + link(g) + '">Zur Folge ' + ICON.pfeil + '</a>' +
    '</article>';
  }

  function zeile(g) {
    var status = hoerbar(g) ? (gehoert(g) ? 'Gehört' : position(g) > 5 ? 'Angefangen' : 'Neu') : 'Bald';
    var a = anteil(g);
    var unterzeile = [g.genre, hoerbar(g) ? g.dauer : null].filter(Boolean).join(' · ');
    var kurz = g.beschreibung ? g.beschreibung.split('\n\n')[0] : '';
    return '<a class="zeile' + (hoerbar(g) ? '' : ' bald') + '" data-nr="' + esc(g.nr) + '" href="' + link(g) + '">' +
      '<span class="spine" style="background:' + esc(g.farbe) + ';color:' + esc(g.schrift) + '">' +
        (g.bild ? '<img src="' + esc(g.bild) + '" alt="">' : '') + '<b>' + esc(g.nr) + '</b></span>' +
      '<span class="zeile-text">' +
        '<span class="zeile-oben"><span class="status s-' + status.toLowerCase() + '">' + (status === 'Gehört' ? ICON.haken + ' ' : '') + status + '</span>' +
'</span>' +
        '<span class="zeile-titel">' + esc(g.titel) + '</span>' +
        '<span class="zeile-meta">' + esc(unterzeile) + '</span>' +
        (kurz ? '<span class="zeile-kurz">' + esc(kurz) + '</span>' : '') +
        (a && a < 100 ? '<span class="mini-fortschritt"><span style="width:' + a.toFixed(1) + '%"></span></span>' : '') +
      '</span></a>';
  }

  /* ---------- Folgenseite mit Player ---------- */

  function zeigePlayer(g) {
    zustand.seite = 'player';
    document.body.classList.add('dunkel');
    document.title = g.titel + ' · Hörregal';
    SPEICHER.schreiben('hr-zuletzt', g.nr);
    zustand.offen = g.nr;
    if (zustand.aktuell !== g) zustand.langText = false;
    if (hoerbar(g) && zustand.aktuell !== g) laden(g);
    miniZeigen();

    var balken = '';
    var zufall = startwert(g.nr);
    for (var i = 0; i < BALKEN; i++) balken += '<span style="height:' + (10 + Math.round(zufall() * 30)) + 'px"></span>';

    var kapitel = (g.kapitel || []).map(function (k, i) {
      return '<button type="button" data-zu="' + sekunden(k[1]) + '"><span class="n">' + (i + 1) + '</span><span>' + esc(k[0]) + '</span><span class="z">' + esc(k[1]) + '</span></button>';
    }).join('');

    var meta = ['Folge ' + g.nr, g.genre, g.dauer, g.datum].filter(Boolean).join(' · ');
    var aktiv = zustand.aktuell === g;

    var beschreibung = g.beschreibung
      ? g.beschreibung.split('\n\n').map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('')
      : '<p>Die Beschreibung folgt.</p>';
    var lang = (g.beschreibung || '').length > 260;

    var weiter = naechste(g);

    app.innerHTML = '<div class="seite">' +
      '<a class="zurueck" href="' + (window.HR_VORSCHAU ? '#start' : '#/') + '">' + ICON.zurueck + ' Hörregal</a>' +
      '<div class="cover" style="background:' + esc(g.farbe) + '">' +
        (g.bild ? '<img src="' + esc(g.bild) + '" alt="Cover zu ' + esc(g.titel) + '">' : '') +
        '<span class="nummer" style="color:' + (g.bild ? 'var(--paper)' : esc(g.schrift)) + '">' + esc(g.nr) + '</span>' +
      '</div>' +
      '<div class="player-titel"><div class="pt-text"><p>' + esc(meta) + '</p><h1>' + esc(g.titel) + '</h1></div>' +
        '<button type="button" class="herz" id="herz" aria-pressed="' + gemerkt(g) + '" aria-label="Zu den Favoriten">' + ICON.herz + '</button></div>' +

      (hoerbar(g)
        ? '<div><div class="welle"><div class="balken" id="balken">' + balken + '</div>' +
            '<input type="range" id="regler" min="0" max="1000" value="0" step="1" aria-label="Position in der Geschichte"></div>' +
            '<div class="zeiten"><span id="jetzt">' + zeit(aktiv ? audio.currentTime : position(g)) + '</span><span id="gesamt">' + (dauerGemerkt(g) ? '−' + zeit(dauerGemerkt(g) - (aktiv ? audio.currentTime : position(g))) : '0:00') + '</span></div></div>' +
          '<div class="steuerung">' +
            '<button type="button" class="klein" id="minus" aria-label="15 Sekunden zurück">−15 s</button>' +
            '<button type="button" class="gross" id="play" aria-label="Abspielen" style="color:var(--ink)">' + ICON.play + '</button>' +
            '<button type="button" class="klein" id="plus" aria-label="30 Sekunden vor">+30 s</button>' +
          '</div>' +
          '<div class="extras"><button type="button" id="schlaf"></button><button type="button" id="tempo"></button></div>'
        : '<p class="hinweis bald-hinweis"><b>Bald im Regal.</b></p>') +

      '<section class="beschreibung' + (lang && !zustand.langText ? ' zu' : '') + '" id="beschreibung"><h2>Worum es geht</h2>' + beschreibung + '</section>' +
      (lang ? '<button type="button" class="mehr" id="mehr">' + (zustand.langText ? 'Weniger anzeigen' : 'Weiterlesen') + '</button>' : '') +

      (g.mitDabei && g.mitDabei.length ? '<section class="mitdabei"><h2>Mit dabei</h2><div class="namen">' +
        g.mitDabei.map(function (n) { return '<span>' + esc(n) + '</span>'; }).join('') + '</div></section>' : '') +

      (kapitel ? '<section class="kapitel"><h2>Kapitel</h2>' + kapitel + '</section>' : '') +

      (weiter ? '<a class="weiter' + (gehoert(g) ? ' hervor' : '') + '" id="weiter" href="' + link(weiter) + '">' +
        '<span class="w-farbe" style="background:' + esc(weiter.farbe) + ';color:' + esc(weiter.schrift) + '">' + esc(weiter.nr) + '</span>' +
        '<span class="w-text"><small>Als Nächstes</small><b>' + esc(weiter.titel) + '</b><small>' + esc(hoerbar(weiter) ? weiter.genre : 'Bald im Regal') + '</small></span>' + ICON.pfeil + '</a>' : '') +
    '</div>';

    document.getElementById('herz').onclick = function () {
      var an = !gemerkt(g);
      if (an) SPEICHER.schreiben('hr-herz-' + g.nr, '1'); else SPEICHER.loeschen('hr-herz-' + g.nr);
      this.setAttribute('aria-pressed', an);
      this.classList.remove('puls'); void this.offsetWidth; if (an) this.classList.add('puls');
    };
    var mehr = document.getElementById('mehr');
    if (mehr) mehr.onclick = function () { zustand.langText = !zustand.langText; document.getElementById('beschreibung').classList.toggle('zu', !zustand.langText); mehr.textContent = zustand.langText ? 'Weniger anzeigen' : 'Weiterlesen'; };

    if (hoerbar(g)) {
      document.getElementById('play').onclick = function () { if (zustand.aktuell !== g) laden(g); umschalten(); };
      document.getElementById('minus').onclick = function () { springe(-15); };
      document.getElementById('plus').onclick = function () { springe(30); };
      document.getElementById('schlaf').onclick = schlafWeiter;
      document.getElementById('tempo').onclick = tempoWeiter;
      document.getElementById('regler').oninput = function (e) {
        if (isFinite(audio.duration)) { audio.currentTime = e.target.value / 1000 * audio.duration; anzeigen(); }
      };
      Array.prototype.forEach.call(app.querySelectorAll('[data-zu]'), function (b) {
        b.onclick = function () { if (zustand.aktuell !== g) laden(g); audio.currentTime = +b.getAttribute('data-zu'); if (audio.paused) audio.play(); anzeigen(); };
      });
      schlafText(); tempoText(); anzeigen(); playKnopf();
    }
    window.scrollTo(0, 0);
  }

  function laden(g) {
    audio.pause();
    zustand.aktuell = g;
    audio.src = g.audio;
    audio.load();
    mediaSession(g);
  }

  function spieleAb(g) {
    if (zustand.aktuell !== g) laden(g);
    umschalten();
  }

  function startwert(text) {
    var s = 0;
    for (var i = 0; i < text.length; i++) s = (s * 31 + text.charCodeAt(i)) >>> 0;
    s = s || 7;
    return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  }

  function umschalten() { if (audio.paused) audio.play().catch(function () {}); else audio.pause(); }

  function springe(d) {
    if (!isFinite(audio.duration)) return;
    audio.currentTime = Math.max(0, Math.min(audio.duration - 1, audio.currentTime + d));
    anzeigen();
  }

  function anzeigen() {
    var g = zustand.aktuell;
    miniFortschritt();
    if (!g || zustand.seite !== 'player' || !document.getElementById('balken')) return;
    if (location.hash.indexOf(g.nr) < 0) return;
    var dauer = isFinite(audio.duration) ? audio.duration : dauerGemerkt(g);
    var jetzt = audio.currentTime || 0;
    var a = dauer ? jetzt / dauer : 0;
    var spans = document.getElementById('balken').children;
    var grenze = Math.round(a * BALKEN);
    for (var i = 0; i < spans.length; i++) spans[i].classList.toggle('an', i < grenze);
    document.getElementById('regler').value = Math.round(a * 1000);
    document.getElementById('jetzt').textContent = zeit(jetzt);
    if (dauer) document.getElementById('gesamt').textContent = '−' + zeit(dauer - jetzt);

    var knoepfe = app.querySelectorAll('[data-zu]'), aktiv = -1;
    for (var k = 0; k < knoepfe.length; k++) if (jetzt >= +knoepfe[k].getAttribute('data-zu')) aktiv = k;
    for (var j = 0; j < knoepfe.length; j++) knoepfe[j].classList.toggle('jetzt', j === aktiv);
  }

  function playKnopf() {
    var b = document.getElementById('play');
    var hier = zustand.seite === 'player' && zustand.aktuell && location.hash.indexOf(zustand.aktuell.nr) >= 0;
    if (b && hier) {
      b.innerHTML = audio.paused ? ICON.play : ICON.pause;
      b.setAttribute('aria-label', audio.paused ? 'Abspielen' : 'Pause');
    }
    var h = document.getElementById('haupt-play');
    if (h) h.innerHTML = (zustand.aktuell && h.getAttribute('data-nr') === zustand.aktuell.nr && !audio.paused) ? ICON.pause : ICON.play;
    var m = document.getElementById('mini-play');
    if (m) { m.innerHTML = audio.paused ? ICON.play : ICON.pause; m.setAttribute('aria-label', audio.paused ? 'Abspielen' : 'Pause'); }
  }

  /* ---------- Mini-Player auf der Startseite ---------- */

  function miniZeigen() {
    var g = zustand.aktuell;
    var zeigen = g && zustand.seite === 'regal' && (audio.currentTime > 0 || !audio.paused);
    document.body.classList.toggle('mit-mini', !!zeigen);
    if (!zeigen) { mini.hidden = true; mini.innerHTML = ''; return; }
    mini.hidden = false;
    mini.innerHTML =
      '<div class="mini-in">' +
        '<a class="mini-link" href="' + link(g) + '">' +
          '<span class="mini-cover" style="background:' + esc(g.farbe) + '">' + (g.bild ? '<img src="' + esc(g.bild) + '" alt="">' : '') + '</span>' +
          '<span class="mini-text"><small>Folge ' + esc(g.nr) + '</small><b>' + esc(g.titel) + '</b></span></a>' +
        '<button type="button" class="mini-play" id="mini-play" style="color:var(--ink)">' + (audio.paused ? ICON.play : ICON.pause) + '</button>' +
      '</div><div class="mini-balken"><span id="mini-stand"></span></div>';
    document.getElementById('mini-play').onclick = umschalten;
    miniFortschritt();
  }

  function miniFortschritt() {
    var s = document.getElementById('mini-stand');
    if (s && isFinite(audio.duration)) s.style.width = (audio.currentTime / audio.duration * 100).toFixed(2) + '%';
  }

  function sichern(sofort) {
    var g = zustand.aktuell;
    if (!g || !hoerbar(g)) return;
    var t = Date.now();
    if (!sofort && t - zustand.letzteSicherung < 4000) return;
    zustand.letzteSicherung = t;
    SPEICHER.schreiben('hr-pos-' + g.nr, String(audio.currentTime || 0));
  }

  /* Sleep-Timer */
  function schlafText() {
    var b = document.getElementById('schlaf');
    if (!b) return;
    var s = schlafStufen[zustand.schlaf];
    b.textContent = s === 0 ? 'Sleep-Timer aus' : s === -1 ? 'Bis Folgenende' : 'Sleep-Timer ' + s + ' Min.';
    b.classList.toggle('aktiv', s !== 0);
  }
  function schlafWeiter() {
    zustand.schlaf = (zustand.schlaf + 1) % schlafStufen.length;
    clearTimeout(zustand.schlafTimer);
    var s = schlafStufen[zustand.schlaf];
    if (s > 0) zustand.schlafTimer = setTimeout(function () { audio.pause(); zustand.schlaf = 0; schlafText(); }, s * 60000);
    schlafText();
  }

  /* Tempo */
  function tempoText() {
    var b = document.getElementById('tempo');
    var t = tempoStufen[zustand.tempo];
    audio.playbackRate = t;
    if (!b) return;
    b.textContent = 'Tempo ' + t.toFixed(2).replace(/0$/, '').replace('.', ',') + 'x';
    b.classList.toggle('aktiv', t !== 1);
  }
  function tempoWeiter() { zustand.tempo = (zustand.tempo + 1) % tempoStufen.length; tempoText(); }

  /* Sperrbildschirm */
  function mediaSession(g) {
    if (!('mediaSession' in navigator) || !hoerbar(g)) return;
    try {
      var art = g.bild ? [{ src: new URL(g.bild, location.href).href, sizes: '1024x1024', type: 'image/jpeg' }] : [];
      navigator.mediaSession.metadata = new MediaMetadata({ title: g.titel, artist: 'Gelesen von Svenja', album: 'Hörregal', artwork: art });
      navigator.mediaSession.setActionHandler('play', function () { audio.play(); });
      navigator.mediaSession.setActionHandler('pause', function () { audio.pause(); });
      navigator.mediaSession.setActionHandler('seekbackward', function () { springe(-15); });
      navigator.mediaSession.setActionHandler('seekforward', function () { springe(30); });
    } catch (e) {}
  }

  /* Audio-Ereignisse */
  audio.addEventListener('loadedmetadata', function () {
    var g = zustand.aktuell;
    if (!g) return;
    SPEICHER.schreiben('hr-dauer-' + g.nr, String(audio.duration));
    var p = position(g);
    if (p > 5 && p < audio.duration - 10) audio.currentTime = p;
    audio.playbackRate = tempoStufen[zustand.tempo];
    anzeigen();
  });
  audio.addEventListener('timeupdate', function () { anzeigen(); sichern(false); });
  audio.addEventListener('play', function () { playKnopf(); if (zustand.seite === 'regal') miniZeigen(); });
  audio.addEventListener('pause', function () { playKnopf(); sichern(true); });
  audio.addEventListener('ended', function () {
    var g = zustand.aktuell;
    if (g) { SPEICHER.loeschen('hr-pos-' + g.nr); SPEICHER.schreiben('hr-fertig-' + g.nr, '1'); zustand.offen = null; }
    if (schlafStufen[zustand.schlaf] === -1) { zustand.schlaf = 0; schlafText(); }
    playKnopf();
    var w = document.getElementById('weiter');
    if (w) { w.classList.add('hervor'); w.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
  });
  window.addEventListener('pagehide', function () { sichern(true); });

  /* Navigation: #/01 öffnet direkt Folge 01 (für die QR-Codes) */
  function route() {
    var m = location.hash.match(/^#\/?f?(\d\d)/);
    var g = m && sichtbar().filter(function (x) { return x.nr === m[1]; })[0];
    if (g) zeigePlayer(g); else zeigeRegal();
  }
  window.addEventListener('hashchange', route);
  route();
})();
