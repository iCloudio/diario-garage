/**
 * Utility per gestione errori strutturata
 */

/**
 * Parse JSON da Response con logging strutturato
 */
export async function safeJsonParse<T>(response: Response): Promise<T | null> {
  try {
    return await response.json();
  } catch (error) {
    console.error("[JSON Parse Error]", {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    });
    return null;
  }
}

/**
 * Gestisce errori API con logging
 */
export function logApiError(
  context: string,
  error: unknown,
  additionalData?: Record<string, unknown>
): void {
  console.error(`[API Error: ${context}]`, {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    ...additionalData,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Gestisce errori con messaggio user-friendly
 */
export function getUserFriendlyErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // Mappa errori comuni a messaggi user-friendly
    if (error.message.includes("network") || error.message.includes("fetch")) {
      return "Errore di connessione. Verifica la tua connessione internet.";
    }
    if (error.message.includes("timeout")) {
      return "La richiesta ha impiegato troppo tempo. Riprova.";
    }
    if (error.message.includes("unauthorized") || error.message.includes("401")) {
      return "Sessione scaduta. Effettua nuovamente il login.";
    }
    if (error.message.includes("forbidden") || error.message.includes("403")) {
      return "Non hai i permessi per questa operazione.";
    }
    if (error.message.includes("not found") || error.message.includes("404")) {
      return "Risorsa non trovata.";
    }
  }

  return "Si è verificato un errore. Riprova.";
}

/**
 * Wrapper per chiamate API con error handling
 */
export async function fetchWithErrorHandling<T>(
  url: string,
  options?: RequestInit,
  context?: string
): Promise<{ data: T | null; error: string | null }> {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      logApiError(context ?? url, new Error(errorMessage), {
        url,
        method: options?.method ?? "GET",
      });
      return {
        data: null,
        error: getUserFriendlyErrorMessage(new Error(errorMessage)),
      };
    }

    const data = await safeJsonParse<T>(response);
    return { data, error: data === null ? "Errore nel parsing della risposta" : null };
  } catch (error) {
    logApiError(context ?? url, error, {
      url,
      method: options?.method ?? "GET",
    });
    return {
      data: null,
      error: getUserFriendlyErrorMessage(error),
    };
  }
}
