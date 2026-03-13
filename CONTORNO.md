# Contorno

## Obiettivo

Raccogliere tutto cio' che non fa parte direttamente del core della piattaforma, ma che serve:

- prima della pubblicazione
- al lancio
- subito dopo il lancio

Questo file serve per non perdere pezzi importanti mentre si lavora sul prodotto.

## 1. Legale e compliance

### Privacy e GDPR

- informativa privacy completa
- cookie policy
- termini e condizioni
- eventuale EULA se ci saranno app mobile
- gestione consenso cookie/tracciamento
- registro dei trattamenti
- verifica base giuridica dei trattamenti
- gestione diritti utente:
  - export dati
  - cancellazione account
  - rettifica
- definire tempi di conservazione dati
- verificare quali dati provider esterni salviamo e per quanto tempo
- capire se servono DPA con:
  - provider database
  - provider email
  - provider analytics
  - provider pagamento
  - provider API esterne

### Altri check legali

- verificare copy marketing e claim
- verificare uso dei dati provenienti da API esterne
- verificare condizioni d'uso dei provider di lookup targa
- valutare copertura assicurativa / limitazione responsabilita'
- verificare obblighi se si aprono piani business/aziendali

## 2. Identita' e sito vetrina

### Sito marketing

- home page chiara
- pagina funzionalita'
- pagina pricing
- FAQ
- contatti
- login / registrazione
- call to action coerenti verso l'app

### Brand

- logo definitivo
- favicon
- icone social
- palette e typography coerenti
- screenshot puliti del prodotto
- mini brand kit

## 3. SEO e contenuti

### Blog / contenuti editoriali

- blog integrato nel sito vetrina
- struttura categorie articoli
- template articoli
- autore / data / aggiornamento
- sitemap SEO
- metadati OpenGraph / Twitter
- schema markup dove utile

### Strategia contenuti

- articoli informativi su:
  - bollo
  - revisione
  - RCA
  - manutenzione
  - costi auto
  - gestione flotte piccole
- articoli comparativi
- articoli how-to
- landing dedicate per keyword importanti

### Distribuzione contenuti

- piano editoriale minimo
- aggiornamenti periodici
- repurposing su newsletter / social / LinkedIn

## 4. Marketing e acquisizione

### Canali a pagamento

- Google Ads
- Meta Ads
- eventualmente TikTok / YouTube / LinkedIn in base al target

### Canali organici

- SEO
- blog
- LinkedIn founder-led
- community / gruppi tematici
- partnership con officine, assicuratori, consulenti auto

### Materiali marketing

- landing per campagne
- copy adv
- creativita'
- pixel / tracciamenti
- UTM standard

## 5. Email, newsletter e comunicazioni

### Infrastruttura email

- dominio mittente
- SPF / DKIM / DMARC
- provider email transazionale
- separazione email transazionali vs marketing

### Email transazionali

- benvenuto
- conferma registrazione
- reset password
- scadenza imminente
- scadenza passata
- riepilogo periodico
- upgrade piano
- pagamento riuscito / fallito
- account eliminato

### Newsletter / lifecycle

- onboarding email sequence
- reminder di ritorno in app
- contenuti educational
- newsletter periodica
- win-back per utenti inattivi

## 6. Analytics e tracking

### Product analytics

- eventi chiave:
  - registrazione
  - primo veicolo creato
  - lookup targa
  - prima scadenza
  - primo rifornimento
  - prima spesa
  - attivazione reminder
  - upgrade
- funnel base
- retention
- activation metrics

### Marketing analytics

- fonte acquisizione
- campagne
- conversione landing -> signup
- signup -> primo veicolo
- primo veicolo -> ritorno

## 7. Supporto e documentazione

### Supporto utente

- pagina help / centro assistenza
- FAQ in-app
- modulo contatto
- casella supporto
- template risposte frequenti

### Documentazione interna

- runbook incidenti
- checklist deploy
- checklist supporto
- changelog

## 8. Pagamenti e monetizzazione operativa

- scelta provider pagamenti
- pagina pricing definitiva
- checkout
- gestione trial
- upgrade / downgrade
- fatture / ricevute se necessarie
- webhook billing
- gestione pagamenti falliti
- gating feature free/premium

## 9. Mobile e distribuzione app

### Da valutare

- partire solo web responsive
- PWA
- app wrapper
- app native iOS / Android

### Se si va su mobile store

- account Apple Developer
- account Google Play Console
- privacy nutrition labels
- screenshot store
- descrizioni store
- ASO
- support policy
- release notes

Nota:
oggi non e' obbligatorio aprire subito iOS/Android. Per il primo lancio puo' bastare una web app ben fatta e mobile-friendly.

## 10. Operativita' pre-lancio

- dominio definitivo
- ambiente staging
- ambiente production
- backup DB
- monitoraggio errori
- logging
- uptime monitoring
- alert base
- test smoke su deploy
- gestione segreti

## 11. Fiducia e credibilita'

- pagina chi siamo / progetto
- contatti reali
- policy trasparenti
- screenshot coerenti
- roadmap pubblica o changelog pubblico
- casi d'uso chiari
- testimonianze quando disponibili

## 12. Go-to-market

### Prima del lancio

- definire target iniziale:
  - consumer singolo
  - famiglia
  - piccola flotta
- preparare waitlist o lista interessati
- preparare demo / screenshots / video breve
- definire messaggio principale

### Al lancio

- landing live
- analytics attivi
- email attive
- supporto pronto
- pricing pronto o almeno strategia free iniziale chiara

### Subito dopo

- raccogliere feedback
- misurare activation
- correggere attriti onboarding
- migliorare retention

## 13. Partnership possibili

- assicurazioni
- officine
- centri revisione
- noleggio / flotte leggere
- consulenti automotive
- commercialisti / PMI con auto aziendali

## 14. Priorita' consigliata

### Priorita' alta

- privacy / termini / cookie
- sito vetrina minimo
- email transazionali base
- analytics base
- supporto minimo
- infrastruttura production

### Priorita' media

- blog / SEO
- campagne paid
- newsletter strutturata
- pricing page pubblica
- ASO / app mobile

### Priorita' bassa

- partnership strutturate
- enterprise materials
- community avanzata

## 15. Raccomandazione pratica

Per non disperdere focus:

### Prima del lancio

chiudere solo:

- legale base
- sito vetrina essenziale
- email transazionali
- analytics base
- supporto minimo
- setup produzione

### Dopo il lancio

aprire:

- blog
- SEO
- campagne
- newsletter
- app mobile
- partnership

## 16. Possibili file futuri collegati

- `LEGAL-CHECKLIST.md`
- `GO-LIVE-CHECKLIST.md`
- `EMAIL-PLAN.md`
- `SEO-CONTENT-PLAN.md`
- `LAUNCH-PLAN.md`
- `PRICING-GATING.md`
