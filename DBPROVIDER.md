# Analisi provider database

## Contesto attuale

L'app gira su Cloudflare ma oggi il backend dati e' costruito chiaramente per PostgreSQL:

- Prisma con `provider = "postgresql"` in [prisma/schema.prisma](/Users/claudio/DEVELOPER/garage-digitale/diario-garage/prisma/schema.prisma)
- adapter `pg` in [lib/db.ts](/Users/claudio/DEVELOPER/garage-digitale/diario-garage/lib/db.ts)
- transazioni esplicite in:
  - [app/api/vehicles/route.ts](/Users/claudio/DEVELOPER/garage-digitale/diario-garage/app/api/vehicles/route.ts)
  - [app/api/vehicles/[id]/route.ts](/Users/claudio/DEVELOPER/garage-digitale/diario-garage/app/api/vehicles/[id]/route.ts)

Quindi la priorita' non e' solo "dove mettere il DB", ma farlo senza introdurre troppo rischio nel flusso applicativo.

## Obiettivo

Trovare un provider compatibile con Cloudflare, riducendo:

- refactor applicativo
- nuovi punti di rottura
- complessita' operativa

## Opzioni sensate

### 1. Postgres gestito diretto

Esempi:

- Neon
- Supabase
- Prisma Postgres
- AWS RDS PostgreSQL

#### Pro

- nessun cambio di paradigma applicativo
- Prisma/Postgres restano invariati
- enum, JSON e transazioni restano coerenti
- minor rischio tecnico

#### Contro

- il DB non e' "dentro" Cloudflare
- possibili considerazioni di latenza e connessioni da Edge/Workers

#### Valutazione

E' la strada piu' pragmatica per questa codebase.

### 2. Postgres gestito + Cloudflare Hyperdrive

Cloudflare propone Hyperdrive come layer per connettere Workers a Postgres/MySQL tradizionali:

- https://developers.cloudflare.com/hyperdrive/
- https://developers.cloudflare.com/hyperdrive/examples/connect-to-postgres/

#### Pro

- migliore integrazione con runtime Cloudflare
- pooling e caching connessioni
- riduzione problemi classici di connessioni da Workers/Edge

#### Contro

- aggiunge un pezzo infrastrutturale in piu'
- e' un ulteriore punto di rottura
- non serve necessariamente subito

#### Valutazione

Ha senso come step 2, non come primo step obbligatorio.

### 3. Cloudflare D1

D1 e' SQLite-based. Prisma lo supporta, ma oggi con vincoli importanti:

- https://docs.prisma.io/docs/v6/orm/overview/databases/cloudflare-d1
- https://developers.cloudflare.com/d1/

#### Pro

- soluzione piu' Cloudflare-native
- meno componenti esterni

#### Contro

- refactor piu' invasivo
- cambio da Postgres a SQLite
- supporto Prisma ancora in `Preview`
- con Prisma su D1 le transazioni non sono supportate come su Postgres

#### Valutazione

Per questa app non e' la scelta consigliata oggi.

## Pricing indicativo

### Neon

- Free: `$0`
- piano a consumo; riferimento tipico di ingresso `~$15/mese`
- pricing pubblico basato su compute/storage

Fonte:

- https://neon.com/pricing

### Supabase

- Free disponibile
- Pro: `$25/mese`
- compute DB piccolo tipicamente `~$10/mese`, ma il piano Pro include crediti

Fonti:

- https://supabase.com/docs/guides/platform/billing-on-supabase
- https://supabase.com/docs/guides/platform/manage-your-usage/compute

### Prisma Postgres

- Free: `$0`
- Starter: `$10/mese`
- pricing anche per operazioni

Fonti:

- https://www.prisma.io/pricing
- https://www.prisma.io/docs/postgres/faq

### AWS RDS PostgreSQL

- pricing a consumo, meno semplice da prevedere per side project piccoli

Fonte:

- https://aws.amazon.com/rds/postgresql/pricing/

### Cloudflare Hyperdrive

- utilizzabile con Workers
- Workers Paid parte da `$5/mese`

Fonti:

- https://developers.cloudflare.com/hyperdrive/platform/pricing/
- https://developers.cloudflare.com/workers/platform/pricing/

## Raccomandazione

Per questa app, la scelta consigliata e':

### Fase 1

Usare un **Postgres gestito diretto**, senza Hyperdrive inizialmente.

Ordine di preferenza pragmatico:

1. Neon
2. Supabase
3. Prisma Postgres

### Fase 2

Valutare Hyperdrive solo se emergono problemi reali di:

- connessioni
- latenza
- comportamento del runtime Cloudflare verso Postgres

## Perche' non Hyperdrive subito

Il dubbio corretto e':

> "se la mia app gira su Cloudflare, aggiungere Hyperdrive non aggiunge un altro punto di rottura?"

Risposta: si', tecnicamente si'.

Per questo motivo non conviene introdurlo subito se:

- oggi la tua app puo' gia' parlare direttamente con un Postgres gestito
- non hai ancora un problema reale da risolvere con Hyperdrive

Quindi:

- `managed Postgres diretto` come default
- `Hyperdrive` solo se serve davvero

## Conclusione netta

Per questa codebase:

- **non** conviene migrare subito a D1
- **non** conviene aggiungere subito Hyperdrive come default
- conviene passare prima a un **Postgres gestito diretto**

La scelta piu' equilibrata oggi e':

- `Neon` se vuoi costo basso e setup semplice
- `Supabase` se vuoi una piattaforma piu' completa
- `Prisma Postgres` se vuoi restare molto vicino all'ecosistema Prisma
