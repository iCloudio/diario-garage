# Go-To-Market

## Obiettivo

Raccogliere in un solo posto tutto cio' che serve per portare DiarioGarage dal prodotto alla pubblicazione:

- monetizzazione
- pricing
- marketing
- legale
- email
- analytics
- supporto
- operativita' di lancio

Questo file sostituisce i documenti separati su pricing e "contorno".

## Strategia di monetizzazione

La monetizzazione consigliata e' semplice:

- core prodotto chiaro e utile
- premium sugli elementi ad alto valore
- servizi esterni/API monetizzati separatamente quando hanno un costo vivo

La monetizzazione non deve passare da pubblicita' invasive o reward ads.
Deve vendere:

- ordine
- tranquillita'
- automazione
- gestione multi-mezzo

## Pricing consigliato

### Consumer

#### Gratis

- `EUR 0`
- 1 veicolo
- scadenze base
- rifornimenti
- spese
- PDF base
- reminder standard

#### Plus

- `EUR 3,99 / mese`
- `EUR 34,99 / anno`
- fino a 5 veicoli
- guidatori
- reminder avanzati
- storico completo
- documenti/allegati
- 5 lookup targa inclusi al mese

#### Family / Pro

- `EUR 6,99 / mese`
- `EUR 59,99 / anno`
- veicoli illimitati
- multi-guidatore piu' flessibile
- condivisione famiglia / team piccolo
- report piu' avanzati
- 20 lookup targa inclusi al mese
- supporto prioritario

### Extra lookup

Se il recupero dati da targa ha un costo vivo, ha senso venderlo anche a consumo:

- `20 lookup = EUR 2,99`
- `50 lookup = EUR 5,99`

### Aziende

Per le aziende il modello consigliato e' `per veicolo attivo / mese`, con minimo mensile.

#### Fleet Starter

- `EUR 2,50 / veicolo / mese`
- minimo `EUR 25 / mese`
- target: 5-20 veicoli

Include:

- scadenze
- rifornimenti
- spese
- guidatori
- export base

#### Fleet Business

- `EUR 4,50 / veicolo / mese`
- minimo `EUR 79 / mese`
- target: 20-100 veicoli

Include tutto Starter, piu':

- ruoli team
- report avanzati
- reminder massivi
- pacchetto lookup targa incluso
- onboarding leggero

#### Fleet Enterprise

- `EUR 7-9 / veicolo / mese`
- minimo `EUR 199 / mese`
- target: 100+ veicoli

Include tutto Business, piu':

- onboarding dedicato
- SLA
- export custom
- eventuali integrazioni
- supporto prioritario reale

#### Setup fee enterprise

Se piu' avanti gestirai import massivi o configurazioni dedicate:

- `EUR 500-1.500` una tantum

## Cosa va fatto prima del lancio

### 1. Legale e compliance

- informativa privacy completa
- cookie policy
- termini e condizioni
- gestione consenso cookie/tracciamento
- registro dei trattamenti
- definizione tempi di conservazione dati
- procedura per export/cancellazione dati utente
- verifica DPA con provider:
  - database
  - email
  - analytics
  - pagamenti
  - API esterne
- verifica uso consentito dei dati importati dai provider targa

### 2. Identita' e sito vetrina

- home page chiara
- pagina funzionalita'
- pagina pricing
- FAQ
- contatti
- accesso login / registrazione
- screenshot prodotto coerenti
- logo, favicon, mini brand kit

### 3. Email e comunicazioni essenziali

- dominio mittente
- SPF / DKIM / DMARC
- provider email transazionale
- email base:
  - benvenuto
  - reset password
  - conferma registrazione
  - reminder scadenza
  - pagamento riuscito / fallito
  - account eliminato

### 4. Analytics minimi

- fonte acquisizione
- registrazione
- primo veicolo creato
- primo lookup targa
- prima scadenza
- primo rifornimento
- primo ritorno in app
- upgrade

### 5. Supporto minimo

- pagina help / FAQ
- casella supporto
- template risposte frequenti

### 6. Setup produzione

- dominio definitivo
- staging
- production
- backup DB
- monitoraggio errori
- logging
- alert base
- test smoke dopo deploy
- gestione segreti

## Cosa aprire subito dopo il lancio

### SEO e contenuti

- blog integrato nel sito vetrina
- categorie articoli
- metadata SEO / OpenGraph
- piano editoriale
- articoli su:
  - bollo
  - revisione
  - RCA
  - manutenzione
  - costi auto
  - gestione mini-flotte

### Marketing

- Google Ads
- Meta Ads
- landing dedicate
- UTM standard
- materiali creativi

### Newsletter e lifecycle

- onboarding sequence
- reminder di ritorno in app
- contenuti educational
- win-back utenti inattivi

### Partnership

- assicurazioni
- officine
- centri revisione
- consulenti automotive
- PMI con auto aziendali

### Mobile

Non e' obbligatorio partire subito con iOS/Android.
Per il primo lancio puo' bastare:

- web app responsive
- eventuale PWA

Le app store native vanno valutate dopo aver validato il core.

## Sequenza consigliata

### Prima fase

- chiudere il core del prodotto
- preparare legale base
- aprire sito vetrina essenziale
- configurare email transazionali
- attivare analytics
- definire pricing, anche se non ancora live

### Seconda fase

- beta privata
- raccolta feedback
- miglioramento onboarding e retention
- test pricing

### Terza fase

- lancio pubblico controllato
- blog/SEO
- campagne
- newsletter
- primi esperimenti business/fleet

## Cosa evitare

- pubblicita' invasive
- reward ads
- pricing troppo complicato
- paywall aggressivi troppo presto
- aprire il fronte enterprise prima di aver chiuso bene il core consumer

## File futuri utili

Se la documentazione cresce, i prossimi file da aprire in modo separato sono:

- `GO-LIVE-CHECKLIST.md`
- `LEGAL-CHECKLIST.md`
- `EMAIL-PLAN.md`
- `SEO-CONTENT-PLAN.md`
- `LAUNCH-PLAN.md`
- `PRICING-GATING.md`
