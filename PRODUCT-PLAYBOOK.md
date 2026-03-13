# Product Playbook

## Scopo del prodotto

DiarioGarage deve aiutare un utente non tecnico a fare 4 cose con il minimo attrito:

1. aggiungere un veicolo rapidamente
2. registrare eventi importanti
3. capire subito cosa richiede attenzione
4. rivedere storico e costi senza perdersi

Il prodotto non deve sembrare una dashboard piena di KPI. Deve sembrare una scheda operativa chiara.

## Modello mentale da seguire

L'utente pensa in questo ordine:

1. questo e' il mio veicolo
2. cosa devo fare adesso
3. aggiungo una spesa, un rifornimento o una scadenza
4. rivedo cosa e' successo nel tempo

Tutta l'app deve rispettare questo ordine.

## Struttura del prodotto

### Garage

Serve a:

- scegliere il veicolo
- aggiungerne uno nuovo
- avere un colpo d'occhio rapido

La card veicolo deve mostrare solo il necessario:

- identita' del mezzo
- scadenze
- ultimo rifornimento
- guidatori

### Scheda veicolo

E' il centro del prodotto.

Deve permettere di:

- capire lo stato attuale
- agire subito
- vedere lo storico
- modificare il minimo indispensabile

### Sezioni dedicate

Devono esistere solo quando hanno un compito chiaro:

- dettagli amministrativi
- export
- analisi secondarie

## Principi UX da mantenere

- meno dashboard, piu' scheda operativa
- piu' timeline e meno contatori
- piu' azioni contestuali e meno pagine separate
- campi facoltativi chiaramente facoltativi
- setup incompleto supportato, non punito

## Stato attuale del prodotto

### Gia' presente

- lista veicoli con creazione inline
- scheda veicolo molto piu' coerente rispetto all'inizio
- scadenze, rifornimenti, spese, guidatori
- lookup targa con cache locale
- import di dati provider sul veicolo
- sezione danger zone
- base pricing ragionata
- analisi provider database ragionata

### Stato sintetico

- prodotto vicino alla visione: `~70%`
- produzione vera: `~40%`

## Cosa manca davvero

### 1. Solidita' del core

- chiudere i bug dei mapping provider
- rendere impeccabile il flusso `aggiungi veicolo`
- rifinire gli stati incompleti
- consolidare `/vehicles` e `/vehicles/[id]`

### 2. Affidabilita' tecnica

- test sui flussi critici
- migrazioni DB pulite
- deploy e database definitivi
- logging e monitoraggio
- gestione errori piu' robusta

### 3. Reminder e automazioni

- notifiche affidabili
- reminder di scadenza
- ritorno in app tramite alert utili

### 4. Monetizzazione e go-to-market

- gating free vs paid
- billing reale
- sito marketing
- onboarding orientato alla conversione

## Miglioramenti UX ancora utili

Le analisi precedenti avevano molte parti ormai superate, ma alcuni punti restano validi e vanno tenuti presenti:

- onboarding piu' chiaro per il primo utente
- empty state che guidino l'azione invece di limitarsi a segnalare assenza dati
- ricerca e filtri nella lista veicoli quando il garage cresce
- loading state e feedback piu' evidenti sui flussi con provider esterni
- reminder come vero motore di ritorno in app
- evitare di trasformare la scheda veicolo in una dashboard troppo densa

## Priorita' operative

### Alta

- chiudere flusso `lookup targa -> creazione veicolo -> RCA`
- consolidare la scheda veicolo
- scegliere database/deploy definitivo
- applicare tutte le migrazioni e verificare stato DB

### Media

- test automatici
- reminder
- migliore osservabilita'
- revisione copy / empty state

### Bassa

- nuove feature laterali
- piani enterprise avanzati
- espansione mobile nativa

## Milestone suggerite

### Beta privata

Condizioni minime:

- creazione veicolo stabile
- lookup stabile
- RCA/scadenze corrette
- scheda veicolo leggibile
- deploy condivisibile

### Beta pubblica controllata

Condizioni minime:

- test flussi core
- monitoring base
- database gestito
- pricing deciso

### Produzione pubblica

Condizioni minime:

- billing
- legale/privacy
- backup e recovery
- supporto minimo
- retention loop funzionante

## Cose da non fare adesso

- aggiungere molte nuove feature prima di chiudere il core
- aprire troppo presto il fronte aziende
- rifare continuamente il design
- monetizzare prima che il prodotto sia affidabile

## Decisione pratica

Da qui in poi il focus deve essere:

- rendere il flusso principale impeccabile
- farlo reggere bene tecnicamente
- costruire il motivo per cui l'utente torna
