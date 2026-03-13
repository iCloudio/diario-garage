# Problemi da risolvere — revisione MVP

Questo file raccoglie i problemi trovati durante la code review dell'MVP.
I primi 5 critici sono già stati fixati (vedi commit su branch `claude/review-mvp-code-ax1BY`).

---

## 🟡 IMPORTANTI

### 6. Cookie di sessione: costante non condivisa tra login/register
**File:** `app/api/auth/login/route.ts`, `app/api/auth/register/route.ts`
**Problema:** Originariamente le route impostano il cookie col nome `"dg_session"` hardcoded
invece di usare la costante `SESSION_COOKIE` da `lib/auth.ts`. Ora che `SESSION_COOKIE` è
esportata, le due route sono già allineate (fix incluso nel commit). Verificare che
`setSessionCookie()` sia usata uniformemente ovunque si setti il cookie.

---

### 7. `forgot-password` è uno stub non funzionante
**File:** `app/api/auth/forgot-password/route.ts`
**Problema:** L'endpoint accetta l'email e risponde sempre `ok: true` senza fare nulla.
Nessuna email viene inviata, nessun token di reset viene generato. Se la UI mostra questa
funzionalità come disponibile, l'utente aspetta una mail che non arriverà mai.
**Da fare:**
- Scegliere un provider email (Resend, SendGrid, Nodemailer)
- Generare un token di reset con scadenza (es. 1 ora) salvato in DB
- Creare la pagina `/reset-password?token=...` che verifica il token e aggiorna la password
- Invalidare il token dopo l'uso

---

### 8. Cache targa senza TTL/scadenza
**File:** `lib/plate-lookup.ts` — funzione `lookupPlate()`
**Problema:** Una targa presente in `PlateLookupCache` viene restituita **per sempre** senza
mai fare una nuova fetch dal provider. I dati RCA (scadenza polizza, compagnia assicurativa)
diventano stale. Un veicolo che rinnova l'assicurazione mostrerà ancora la vecchia polizza.
**Da fare:**
- Aggiungere logica TTL: se `fetchedAt` è più vecchio di N giorni (es. 7), forza re-fetch
- Oppure aggiungere un endpoint manuale "aggiorna dati targa" per forzare il refresh

```ts
// Esempio di logica TTL in lookupPlate()
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 giorni
if (cached && Date.now() - cached.fetchedAt.getTime() < CACHE_TTL_MS) {
  return mapRecordToResult(cached, "cache");
}
// altrimenti procedi con fetch dal provider
```

---

### 9. `Promise.all` su update scadenze senza transazione
**File:** `app/api/deadlines/route.ts` — funzione `PUT`
**Problema:** Gli upsert/deleteMany delle scadenze vengono eseguiti in parallelo con
`Promise.all` fuori da una transazione DB. Se un'operazione fallisce a metà, le scadenze
rimangono in stato parzialmente aggiornato (alcune aggiornate, altre no).
**Da fare:**
```ts
await db.$transaction(async (tx) => {
  await Promise.all(
    deadlines.map(async (item) => {
      // ... upsert/deleteMany usando tx invece di db
    })
  );
});
```

---

### 10. Nessuna paginazione su expenses e refuels
**File:** `app/api/expenses/route.ts`, `app/api/refuels/route.ts` — handler `GET`
**Problema:** `findMany` senza `take`/`skip`. Per un utente con anni di dati, queste
query caricheranno migliaia di record in memoria e nel payload JSON.
**Da fare:**
- Aggiungere query params `?page=1&limit=50`
- Oppure cursor-based pagination con `?cursor=<id>`
- Valutare se il frontend carica tutto in una volta o supporta infinite scroll

---

## 🔵 MINORI / TECNICI

### 11. Funzioni duplicate tra `lib/plate-lookup.ts` e `lib/providers/tuttotarghe.ts`
**Problema:** `normalizeFuelType`, `normalizeVehicleType`, `normalizePlate` e
`parseProviderDate` sono implementate in modo identico in entrambi i file. Se cambia la
logica (es. nuovo tipo di carburante: IDROGENO), va aggiornato in due posti.
**Da fare:** Estrarre in un file condiviso `lib/vehicle-normalizers.ts` e importare da lì.

---

### 12. Scraping HTML del sito MIMIT è fragile
**File:** `lib/fuel-prices.ts`
**Problema:** Il parsing dei prezzi carburante dipende dalla struttura HTML del sito del
Ministero (`mimit.gov.it`). Qualsiasi cambio di layout (anche solo un tag diverso) rompe
silenziosamente il sync o genera `"No regional fuel rows parsed from MIMIT page"`.
Non c'è nessun alerting/monitoring su questo errore.
**Da fare:**
- Aggiungere logging strutturato con severity ERROR quando il parsing fallisce
- Valutare se MIMIT espone API ufficiali o dataset strutturati (CSV/JSON)
- Eventualmente aggiungere un health check endpoint per verificare che l'ultimo sync
  abbia avuto successo e quando

---

### 13. Pool PostgreSQL ricreato ad ogni cold start in produzione
**File:** `lib/db.ts`
**Problema:** In produzione, `global.prisma` e `global.pgPool` non vengono salvati (by
design per Next.js serverless). In ambienti serverless ogni cold start crea un nuovo `Pool`.
Senza un connection pooler esterno, si rischia di esaurire le connessioni PostgreSQL sotto
carico (PostgreSQL di default ha max 100 connessioni).
**Da fare:**
- In produzione: usare PgBouncer, Supabase con Supavisor, o Neon con connection pooling
- Configurare `pool.max` in base alle connessioni disponibili del piano DB scelto
- Monitorare `pg_stat_activity` per verificare che non si superi il limite

---

### 14. Messaggio di errore Tuttotarghe espone info di configurazione interna
**File:** `lib/providers/tuttotarghe.ts:232`
**Problema:** Se `TUTTOTARGHE_API_TOKEN` non è configurato, il messaggio
`"TUTTOTARGHE_API_TOKEN non configurato."` poteva raggiungere il client via
`/api/plates/lookup` (ora fixato: il lookup espone solo messaggi generici).
Verificare che nessun messaggio interno raggiunga il client in produzione.

---

### 15. Validazione formato targa troppo permissiva
**File:** `app/api/vehicles/route.ts`, `app/api/plates/lookup/route.ts`
**Problema:** La validazione Zod accetta `z.string().min(5).max(10)` — qualsiasi stringa
da 5 a 10 caratteri. Targhe non valide (es. `"AAAAA"`) vengono salvate nel DB.
**Da fare:** Aggiungere regex per i formati italiani (e eventualmente esteri):
```ts
plate: z.string()
  .min(5).max(10)
  .regex(/^[A-Z0-9]{5,10}$/, "Formato targa non valido")
```
Formato targa italiana standard: `AB123CD` (2 lettere + 3 cifre + 2 lettere).

---

### 16. Nessuna validazione incrociata status/soldDate
**File:** `app/api/vehicles/[id]/route.ts` — PATCH
**Problema:** Non c'è validazione che impedisca di impostare `soldDate`/`soldPrice` su un
veicolo con status `ATTIVO`, o viceversa di mettere `status: "VENDUTO"` senza `soldDate`.
La logica di business non è garantita a livello API, solo eventualmente nel frontend.
**Da fare:**
```ts
if (status === "VENDUTO" && !soldDate && !vehicle.soldDate) {
  return NextResponse.json({ error: "Data vendita obbligatoria per veicoli venduti." }, { status: 400 });
}
```

---

## 📋 Riepilogo priorità

| # | Priorità | Titolo | Effort |
|---|---|---|---|
| 7 | 🟡 Alta | Implementare forgot-password reale | Alto |
| 8 | 🟡 Alta | Cache targa con TTL | Basso |
| 9 | 🟡 Media | Transaction su update deadlines | Basso |
| 10 | 🟡 Media | Paginazione expenses/refuels | Medio |
| 11 | 🔵 Bassa | Deduplicare funzioni di normalizzazione | Basso |
| 12 | 🔵 Bassa | Monitoring su MIMIT scraping | Medio |
| 13 | 🔵 Bassa | Connection pooling in produzione | Medio |
| 14 | 🔵 Bassa | Error messages interni | Basso |
| 15 | 🔵 Bassa | Regex validazione formato targa | Basso |
| 16 | 🔵 Bassa | Validazione incrociata status/soldDate | Basso |
