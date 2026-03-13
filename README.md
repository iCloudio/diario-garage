# DiarioGarage

Web app per tenere sotto controllo scadenze, rifornimenti, spese e dati essenziali dei propri veicoli.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- Prisma + PostgreSQL

## Avvio locale

```bash
npm run dev
```

## Prisma

```bash
npx prisma migrate dev --name <nome_migrazione>
npx prisma generate
```

## Documentazione utile

### Prodotto

- `PRODUCT-PLAYBOOK.md`
  Visione del prodotto, stato attuale, priorita' e milestone.

### Go-to-market

- `GO-TO-MARKET.md`
  Pricing, monetizzazione, legale, marketing, email, lancio.

### Database e infrastruttura

- `DBPROVIDER.md`
  Analisi della scelta del provider database e del rapporto con Cloudflare.

## Stato della documentazione

La documentazione e' stata ripulita e consolidata per evitare sovrapposizioni tra roadmap, analisi UX e note strategiche.
