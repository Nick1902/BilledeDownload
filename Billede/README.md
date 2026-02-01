# Billede Generator 🎨

En simpel webformular hvor brugere kan uploade deres portræt, justere positionen og generere et færdigt billede med tekst.

## 📋 Hvad gør den?

Brugerne kan:
- Se jeres faste baggrundsbillede
- Uploade deres eget portræt i en fast boks
- Justere positionen (vandret/lodret) og zoom på deres billede
- Indtaste navn og titel
- Generere og downloade det færdige resultat som PNG

## 🚀 Sådan kommer du i gang

### 1. Tilføj dit baggrundsbillede
- Placer dit baggrundsbillede i mappen og omdøb det til `baggrund.jpg`
- Eller rediger `index.html` linje 22 og ændr `src="baggrund.jpg"` til dit billednavn

### 2. Test lokalt
- Åbn `index.html` i en browser
- Upload et testbillede
- Juster position og zoom
- Udfyld navn og titel
- Klik "Generér billede"

### 3. Deploy til web
Vælg én af disse gratis hosting-løsninger:

#### Option A: Netlify (anbefalet)
1. Gå til [netlify.com](https://netlify.com)
2. Træk hele mappen ind på deres side
3. Få et link (f.eks. `https://dit-projekt.netlify.app`)

#### Option B: Vercel
1. Gå til [vercel.com](https://vercel.com)
2. Import projektet
3. Deploy med ét klik

#### Option C: GitHub Pages
1. Upload filerne til et GitHub repository
2. Aktivér GitHub Pages i Settings
3. Få et link (f.eks. `https://dinbruger.github.io/projekt`)

### 4. Send linket til modtagerne
Send linket i en mail - ingen login eller downloads krævet! 🎉

## 📁 Filstruktur

```
Billede/
├── index.html      # Hovedsiden med formular
├── styles.css      # Design og layout
├── script.js       # Funktionalitet (upload, positionering, generering)
├── baggrund.jpg    # Dit baggrundsbillede (skal tilføjes)
└── README.md       # Denne fil
```

## 🎨 Tilpasning

### Ændre boksens position
I `styles.css` linje 85-86:
```css
top: 20%;           /* Juster lodret position (0-100%) */
left: 50%;          /* Juster vandret position (0-100%) */
```

### Ændre boksens størrelse
I `styles.css` linje 88-89:
```css
width: 200px;       /* Bredde af billedboks */
height: 200px;      /* Højde af billedboks */
```

### Ændre tekststørrelse og position
I `styles.css` linje 134-148:
```css
bottom: 15%;        /* Afstand fra bunden */
font-size: 1.8rem;  /* Størrelse på navn */
font-size: 1.2rem;  /* Størrelse på titel */
```



- **Ingen backend nødvendig** - alt kører i browseren
- **Ingen database** - billedet genereres og downloades direkte
- **Privacy-venlig** - intet uploades til en server
- **Cross-browser** - virker i alle moderne browsere

## 💡 Tips

- Brug et højkvalitets baggrundsbillede (min. 1000x1000px)
- Test med forskellige billedformater (JPG, PNG)
- Tjek at det ser godt ud på mobil også
- Overvej at tilføje instruktioner direkte på siden

## 📧 Eksempel på mail til modtagere

```
Hej [Navn],

Klik på linket nedenfor for at tilføje dit billede:
https://dit-projekt.netlify.app

Det tager kun 2 minutter:
1. Upload dit portræt
2. Juster positionen
3. Udfyld navn og titel
4. Download resultatet

Mvh,
[Dit navn]
```

## ❓ Problemer?

- **Billedet vises ikke**: Tjek at `baggrund.jpg` ligger i samme mappe
- **Kan ikke uploade**: Prøv et andet billedformat (JPG eller PNG)
- **Download virker ikke**: Tjek browser-indstillinger for downloads
- **Ser mærkeligt ud på mobil**: Siden er responsive, men test grundigt

## 🎯 Næste skridt

Mulige forbedringer:
- Send resultatet direkte til dig via email (kræver backend)
- Gem alle billeder i en database (kræver backend)
- Tilføj flere tekstfelter eller farvevalg
- Tilføj billedfiltre eller effekter
