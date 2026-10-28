(function () {
  'use strict';

  var app = document.getElementById('app');
  var audio = document.getElementById('audio');
  var VORSCHAU = /[?&]vorschau/.test(location.search);
  var BALKEN = 48;

  var SPEICHER = {
    lesen: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    schreiben: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
    loeschen: function (k) { try { localStorage.removeItem(k); } catch (e) {} }
  };

  var schlafStufen = [0, 10, 20, 30, -1];
  var tempoStufen = [1, 1.25, 0.85];
  var zustand = { aktuell: null, schlaf: 0, schlafTimer: null, tempo: 0, letzteSicherung: 0 };

  function heute() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function sichtbar() {
    return (window.GESCHICHTEN || []).filter(function (g) {
      return VORSCHAU || !g.sichtbarAb || heute() >= g.sichtbarAb;
    });
  }

  function hoerbar(g) { return !!(g.audio && g.audio.trim()); }
  function oeffenbar(g) { return hoerbar(g) || VORSCHAU; }

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

  function link(g) { return '#/' + g.nr + (VORSCHAU ? '' : ''); }

  var ICON = {
    play: '<svg aria-hidden="true" width="26" height="26" viewBox="0 0 26 26"><path d="M8 4 L22 13 L8 22 Z" fill="currentColor"/></svg>',
    pause: '<svg aria-hidden="true" width="26" height="26" viewBox="0 0 26 26"><rect x="6" y="4" width="5" height="18" rx="1" fill="currentColor"/><rect x="15" y="4" width="5" height="18" rx="1" fill="currentColor"/></svg>',
    zurueck: '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 3 L5 9 L11 15"/></svg>'
  };

  /* ---------- Startseite ---------- */

  function zeigeRegal() {
    document.body.classList.remove('dunkel');
    document.title = 'Hörregal';
    var liste = sichtbar();
    var verfuegbar = liste.filter(hoerbar);

    var zuletzt = SPEICHER.lesen('hr-zuletzt');
    var haupt = liste.filter(function (g) { return g.nr === zuletzt && oeffenbar(g); })[0]
      || verfuegbar.filter(function (g) { return !gehoert(g); })[0]
      || verfuegbar[verfuegbar.length - 1]
      || liste[0];

    var html = '<div class="seite">' +
      '<header class="kopf"><div><p>Für Bärchi · 05.12.</p><h1>Hör<br>regal.</h1></div>' +
      '<span class="zaehler" aria-label="' + verfuegbar.length + ' von ' + liste.length + ' Geschichten hörbar">' + verfuegbar.length + ' / ' + liste.length + '</span></header>' +
      '<p class="intro">Geschichten aus Ostbelgien. Eingesprochen von Svenja.</p>';

    if (haupt) html += hauptkarte(haupt);

    var rest = liste.filter(function (g) { return g !== haupt; });
    html += '<div class="raster">';
    rest.forEach(function (g) { html += kachel(g); });
    if (liste.some(function (g) { return !hoerbar(g); })) html += '<div class="platzhalter">Fortsetzung folgt</div>';
    html += '</div><p class="fuss">Gute Nacht, Bärchi.</p></div>';

    app.innerHTML = html;
  }

  function hauptkarte(g) {
    var pos = position(g), dauer = dauerGemerkt(g);
    var marke = !hoerbar(g) ? 'Bald im Regal' : gehoert(g) ? 'Schon gehört' : pos > 5 ? 'Weiterhören ab ' + zeit(pos) : 'Neu im Regal';
    var anteil = dauer && pos ? Math.min(100, pos / dauer * 100) : 0;
    var meta = [g.genre, g.dauer].filter(Boolean).join(' · ');
    var inhalt =
      '<div class="bildflaeche" style="background:' + esc(g.farbe) + '">' +
        (g.bild ? '<img src="' + esc(g.bild) + '" alt="">' : '') +
        '<span class="marke">' + esc(marke) + '</span>' +
        '<span class="nummer" style="color:' + (g.bild ? 'var(--paper)' : esc(g.schrift)) + '">' + esc(g.nr) + '</span>' +
      '</div>' +
      (anteil ? '<div class="fortschritt"><span style="width:' + anteil.toFixed(1) + '%"></span></div>' : '') +
      '<div class="unten"><div class="texte"><p class="meta">' + esc(meta) + '</p><h2>' + esc(g.titel) + '</h2></div>' +
      (oeffenbar(g) ? '<span class="playrund" aria-hidden="true" style="color:var(--ink)">' + ICON.play + '</span>' : '') + '</div>';
    return oeffenbar(g)
      ? '<a class="hauptkarte" href="' + link(g) + '" aria-label="' + esc(g.titel) + ' öffnen">' + inhalt + '</a>'
      : '<div class="hauptkarte">' + inhalt + '</div>';
  }

  function kachel(g) {
    var status = hoerbar(g) ? (gehoert(g) ? 'Gehört' : 'Neu') : (g.sichtbarAb && heute() < g.sichtbarAb ? 'Ab ' + g.sichtbarAb.split('-').reverse().slice(0, 2).join('.') + '.' : 'Bald');
    var klassen = 'kachel' + (g.bild ? ' hat-bild' : '') + (oeffenbar(g) ? '' : ' bald');
    var inhalt =
      (g.bild ? '<img class="kachelbild" src="' + esc(g.bild) + '" alt="">' : '') +
      '<div class="oben"><span class="nr">' + esc(g.nr) + '</span><span class="status">' + esc(status) + '</span></div>' +
      '<div><p class="titel">' + esc(g.titel) + '</p><p class="genre">' + esc(g.genre) + '</p></div>';
    var stil = 'background:' + esc(g.farbe) + ';color:' + esc(g.schrift);
    return oeffenbar(g)
      ? '<a class="' + klassen + '" style="' + stil + '" href="' + link(g) + '">' + inhalt + '</a>'
      : '<div class="' + klassen + '" style="' + stil + '">' + inhalt + '</div>';
  }

  /* ---------- Player ---------- */

  function zeigePlayer(g) {
    document.body.classList.add('dunkel');
    document.title = g.titel + ' · Hörregal';
    SPEICHER.schreiben('hr-zuletzt', g.nr);

    var neu = zustand.aktuell !== g;
    zustand.aktuell = g;
    if (neu) {
      audio.pause();
      if (hoerbar(g)) { audio.src = g.audio; audio.load(); }
      else { audio.removeAttribute('src'); audio.load(); }
    }

    var balken = '';
    var zufall = startwert(g.nr);
    for (var i = 0; i < BALKEN; i++) balken += '<span style="height:' + (10 + Math.round(zufall() * 30)) + 'px"></span>';

    var kapitel = (g.kapitel || []).map(function (k, i) {
      return '<button type="button" data-zu="' + sekunden(k[1]) + '"><span class="n">' + (i + 1) + '</span><span>' + esc(k[0]) + '</span><span class="z">' + esc(k[1]) + '</span></button>';
    }).join('');

    var meta = [g.nr, g.genre, 'gelesen von Svenja'].filter(Boolean).join(' · ');

    app.innerHTML = '<div class="seite">' +
      '<a class="zurueck" href="#/">' + ICON.zurueck + ' Hörregal</a>' +
      '<div class="cover" style="background:' + esc(g.farbe) + '">' +
        (g.bild ? '<img src="' + esc(g.bild) + '" alt="Cover zu ' + esc(g.titel) + '">' : '<span class="nummer" style="color:' + esc(g.schrift) + '">' + esc(g.nr) + '</span>') +
      '</div>' +
      '<div class="player-titel"><p>' + esc(meta) + '</p><h1>' + esc(g.titel) + '</h1></div>' +
      (hoerbar(g) ? '' : '<p class="hinweis">Die Aufnahme folgt. Diese Ansicht siehst du nur in der Vorschau.</p>') +
      '<div><div class="welle"><div class="balken" id="balken">' + balken + '</div>' +
        '<input type="range" id="regler" min="0" max="1000" value="0" step="1" aria-label="Position in der Geschichte"' + (hoerbar(g) ? '' : ' disabled') + '></div>' +
        '<div class="zeiten"><span id="jetzt">0:00</span><span id="gesamt">' + (dauerGemerkt(g) ? zeit(dauerGemerkt(g)) : '0:00') + '</span></div></div>' +
      '<div class="steuerung">' +
        '<button type="button" class="klein" id="minus" aria-label="15 Sekunden zurück">−15 s</button>' +
        '<button type="button" class="gross" id="play" aria-label="Abspielen" style="color:var(--ink)"' + (hoerbar(g) ? '' : ' disabled') + '>' + ICON.play + '</button>' +
        '<button type="button" class="klein" id="plus" aria-label="15 Sekunden vor">+15 s</button>' +
      '</div>' +
      '<div class="extras"><button type="button" id="schlaf"></button><button type="button" id="tempo"></button></div>' +
      (kapitel ? '<section class="kapitel"><h2>Kapitel</h2>' + kapitel + '</section>' : '') +
    '</div>';

    document.getElementById('play').onclick = umschalten;
    document.getElementById('minus').onclick = function () { springe(-15); };
    document.getElementById('plus').onclick = function () { springe(15); };
    document.getElementById('schlaf').onclick = schlafWeiter;
    document.getElementById('tempo').onclick = tempoWeiter;
    document.getElementById('regler').oninput = function (e) {
      if (isFinite(audio.duration)) { audio.currentTime = e.target.value / 1000 * audio.duration; anzeigen(); }
    };
    Array.prototype.forEach.call(app.querySelectorAll('[data-zu]'), function (b) {
      b.onclick = function () { audio.currentTime = +b.getAttribute('data-zu'); if (audio.paused) audio.play(); anzeigen(); };
    });

    schlafText(); tempoText(); anzeigen(); playKnopf(); mediaSession(g);
    window.scrollTo(0, 0);
  }

  function startwert(text) {
    var s = 0;
    for (var i = 0; i < text.length; i++) s = (s * 31 + text.charCodeAt(i)) >>> 0;
    s = s || 7;
    return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  }

  function umschalten() { if (audio.paused) audio.play(); else audio.pause(); }

  function springe(d) {
    if (!isFinite(audio.duration)) return;
    audio.currentTime = Math.max(0, Math.min(audio.duration - 1, audio.currentTime + d));
    anzeigen();
  }

  function anzeigen() {
    var g = zustand.aktuell;
    if (!g || !document.getElementById('balken')) return;
    var dauer = isFinite(audio.duration) ? audio.duration : dauerGemerkt(g);
    var jetzt = audio.currentTime || 0;
    var anteil = dauer ? jetzt / dauer : 0;
    var spans = document.getElementById('balken').children;
    var grenze = Math.round(anteil * BALKEN);
    for (var i = 0; i < spans.length; i++) spans[i].classList.toggle('an', i < grenze);
    document.getElementById('regler').value = Math.round(anteil * 1000);
    document.getElementById('jetzt').textContent = zeit(jetzt);
    if (dauer) document.getElementById('gesamt').textContent = zeit(dauer);

    var knoepfe = app.querySelectorAll('[data-zu]'), aktiv = -1;
    for (var k = 0; k < knoepfe.length; k++) if (jetzt >= +knoepfe[k].getAttribute('data-zu')) aktiv = k;
    for (var j = 0; j < knoepfe.length; j++) knoepfe[j].classList.toggle('jetzt', j === aktiv);
  }

  function playKnopf() {
    var b = document.getElementById('play');
    if (!b) return;
    b.innerHTML = audio.paused ? ICON.play : ICON.pause;
    b.setAttribute('aria-label', audio.paused ? 'Abspielen' : 'Pause');
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
    b.textContent = s === 0 ? 'Sleep-Timer aus' : s === -1 ? 'Bis zum Ende' : 'Sleep-Timer ' + s + ' Min.';
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
    if (!b) return;
    var t = tempoStufen[zustand.tempo];
    b.textContent = 'Tempo ' + t.toFixed(2).replace(/0$/, '').replace('.', ',') + 'x';
    b.classList.toggle('aktiv', t !== 1);
    audio.playbackRate = t;
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
      navigator.mediaSession.setActionHandler('seekforward', function () { springe(15); });
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
  audio.addEventListener('play', playKnopf);
  audio.addEventListener('pause', function () { playKnopf(); sichern(true); });
  audio.addEventListener('ended', function () {
    var g = zustand.aktuell;
    if (g) { SPEICHER.loeschen('hr-pos-' + g.nr); SPEICHER.schreiben('hr-fertig-' + g.nr, '1'); }
    if (schlafStufen[zustand.schlaf] === -1) { zustand.schlaf = 0; schlafText(); }
    playKnopf();
  });
  window.addEventListener('pagehide', function () { sichern(true); });

  /* Navigation: #/01 öffnet direkt Geschichte 01 (für die QR-Codes) */
  function route() {
    var m = location.hash.match(/^#\/(\w+)/);
    var g = m && sichtbar().filter(function (x) { return x.nr === m[1]; })[0];
    if (g && oeffenbar(g)) zeigePlayer(g); else zeigeRegal();
  }
  window.addEventListener('hashchange', route);
  route();
})();
