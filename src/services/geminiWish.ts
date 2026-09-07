import { getRandomWish } from '@/data/wishes';

interface GeminiWishResponse {
  wish: string;
}

/**
 * Calls the server-side edge function which talks to the Gemini Flash model
 * to generate a fresh 2-line wish. Falls back to a pre-written wish if the
 * API is unavailable.
 */
export async function generateWish(templateId: string, templateName: string): Promise<string> {
  const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gemini-wish`;

  try {
    const res = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ templateName }),
    });

    if (!res.ok) {
      // Server error — fall back to static wish
      return getRandomWish(templateId);
    }

    const data: GeminiWishResponse = await res.json();

    if (!data.wish || typeof data.wish !== 'string') {
      return getRandomWish(templateId);
    }

    // Clean up: remove any leading/trailing quotes, trim whitespace
    const cleaned = data.wish.replace(/^["']+|["']+$/g, '').trim();

    if (!cleaned) {
      return getRandomWish(templateId);
    }

    return cleaned;
  } catch {
    // Network error or timeout — fall back to static wish
    return getRandomWish(templateId);
  }
}
