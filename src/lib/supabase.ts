import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
const reviewsTable = import.meta.env.PUBLIC_SUPABASE_REVIEWS_TABLE ?? 'portfolio_reviews';
const eventsTable = import.meta.env.PUBLIC_SUPABASE_EVENTS_TABLE ?? 'portfolio_events';

let supabaseClient: SupabaseClient | null = null;

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

export function getSupabaseClient() {
  if (!isSupabaseConfigured()) return null;

  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    });
  }

  return supabaseClient;
}

export function getReviewsTableName() {
  return reviewsTable;
}

export function getEventsTableName() {
  return eventsTable;
}

export async function logPortfolioEvent(eventName: string, payload: Record<string, unknown> = {}) {
  const client = getSupabaseClient();
  if (!client) return { ok: false, reason: 'supabase-not-configured' };

  const response = await client.from(eventsTable).insert({
    event_name: eventName,
    page_path: window.location.pathname,
    referrer: document.referrer || null,
    metadata: payload
  });

  return { ok: !response.error, error: response.error };
}

export type ReviewRecord = {
  id: string;
  client_name?: string;
  client_photo?: string | null;
  company?: string | null;
  position?: string | null;
  testimonial: string;
  rating: number;
  approved?: boolean;
  created_at?: string;
};

export type ReviewInput = {
  client_name: string;
  client_photo?: string;
  company?: string;
  position?: string;
  testimonial: string;
  rating: number;
};

export async function fetchApprovedReviews() {
  const client = getSupabaseClient();
  if (!client) return { reviews: [] as ReviewRecord[], error: null };

  const response = await client
    .from(reviewsTable)
    .select('*')
    .eq('approved', true)
    .order('created_at', { ascending: false });

  return {
    reviews: (response.data ?? []) as ReviewRecord[],
    error: response.error
  };
}

export async function submitReview(review: ReviewInput) {
  const client = getSupabaseClient();
  if (!client) return { ok: false, error: new Error('Supabase is not configured.') };

  const response = await client.from(reviewsTable).insert({
    client_name: review.client_name,
    client_photo: review.client_photo || null,
    company: review.company || null,
    position: review.position || null,
    testimonial: review.testimonial,
    rating: review.rating,
    approved: false
  });

  return { ok: !response.error, error: response.error };
}
