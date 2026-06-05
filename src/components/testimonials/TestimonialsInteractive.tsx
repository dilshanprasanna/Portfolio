import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  fetchApprovedReviews,
  getReviewsTableName,
  isSupabaseConfigured,
  logPortfolioEvent,
  submitReview,
  type ReviewRecord
} from '../../lib/supabase';

type TestimonialsFallbackItem = {
  id: string;
  clientName: string;
  clientPhoto: string;
  company: string;
  position: string;
  testimonial: string;
  rating: number;
  order: number;
  visible: boolean;
  approved: boolean;
};

type TestimonialsRatings = {
  allowVisitorRatings: boolean;
  averageRating: number;
  ratingCount: number;
  reviewSubmission: boolean;
  adminControls: {
    approveReviews: boolean;
    deleteReviews: boolean;
    hideReviews: boolean;
  };
};

type TestimonialsInteractiveProps = {
  items: TestimonialsFallbackItem[];
  ratings: TestimonialsRatings;
};

type ReviewFormState = {
  clientName: string;
  company: string;
  position: string;
  testimonial: string;
  rating: string;
  clientPhoto: string;
};

const initialReviewForm: ReviewFormState = {
  clientName: '',
  company: '',
  position: '',
  testimonial: '',
  rating: '5',
  clientPhoto: ''
};

function normalizeReview(review: ReviewRecord | TestimonialsFallbackItem) {
  return {
    id: review.id,
    clientName: 'client_name' in review ? review.client_name ?? '' : review.clientName,
    clientPhoto: 'client_photo' in review ? review.client_photo ?? '' : review.clientPhoto,
    company: 'company' in review ? review.company ?? '' : review.company,
    position: 'position' in review ? review.position ?? '' : review.position,
    testimonial: review.testimonial,
    rating: review.rating
  };
}

export default function TestimonialsInteractive({ items, ratings }: TestimonialsInteractiveProps) {
  const [reviews, setReviews] = useState<Array<ReturnType<typeof normalizeReview>>>(
    [...items].filter((item) => item.visible && item.approved).sort((a, b) => a.order - b.order).map(normalizeReview)
  );
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [formValues, setFormValues] = useState<ReviewFormState>(initialReviewForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const summary = useMemo(() => {
    if (!reviews.length) {
      return {
        averageRating: ratings.averageRating,
        ratingCount: ratings.ratingCount
      };
    }

    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return {
      averageRating: Number((total / reviews.length).toFixed(1)),
      ratingCount: reviews.length
    };
  }, [ratings.averageRating, ratings.ratingCount, reviews]);

  useEffect(() => {
    let mounted = true;

    async function loadReviews() {
      if (!isSupabaseConfigured()) {
        setStatus('ready');
        return;
      }

      setStatus('loading');
      const response = await fetchApprovedReviews();

      if (!mounted) return;

      if (response.error) {
        setStatus('error');
        setErrorMessage('Unable to load live testimonials right now. Showing fallback content.');
        return;
      }

      if (response.reviews.length) {
        setReviews(response.reviews.map(normalizeReview));
      }

      setStatus('ready');
    }

    void loadReviews();

    return () => {
      mounted = false;
    };
  }, []);

  const updateField = (field: keyof ReviewFormState, value: string) => {
    setFormValues((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!ratings.reviewSubmission) return;

    if (!formValues.clientName.trim() || !formValues.testimonial.trim()) {
      setErrorMessage('Name and testimonial are required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await submitReview({
        client_name: formValues.clientName.trim(),
        client_photo: formValues.clientPhoto.trim(),
        company: formValues.company.trim(),
        position: formValues.position.trim(),
        testimonial: formValues.testimonial.trim(),
        rating: Number(formValues.rating)
      });

      if (!response.ok) {
        throw new Error('Review submission failed.');
      }

      setFormValues(initialReviewForm);
      void logPortfolioEvent('review_submit', {
        table: getReviewsTableName(),
        rating: Number(formValues.rating)
      });
      setErrorMessage('Thanks for your review. It will appear after approval.');
    } catch (error) {
      setErrorMessage('Unable to submit review right now. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="testimonials" className="content-section testimonials-section">
      <div className="section-heading">
        <p className="eyebrow">Testimonials</p>
        <h2>Client Feedback</h2>
        <p>Supabase-backed review fetching and submission, with a static fallback when the database is unavailable.</p>
      </div>

      <div className="testimonials-summary">
        <div>
          <strong>{summary.averageRating}</strong>
          <span>Average Rating</span>
        </div>
        <div>
          <strong>{summary.ratingCount}</strong>
          <span>Reviews</span>
        </div>
        <div>
          <strong>{isSupabaseConfigured() ? 'Live' : 'Fallback'}</strong>
          <span>Status</span>
        </div>
      </div>

      <div className="testimonials-grid">
        {reviews.map((review) => (
          <article key={review.id} className="testimonial-card">
            <div className="testimonial-header">
              <img src={review.clientPhoto || '/images/profile.jpg'} alt={review.clientName} loading="lazy" decoding="async" />
              <div>
                <h3>{review.clientName}</h3>
                <p>{review.position}</p>
                <p>{review.company}</p>
              </div>
            </div>
            <div className="testimonial-rating" aria-label={`${review.rating} out of 5 stars`}>
              {'★★★★★'.slice(0, review.rating)}{'☆☆☆☆☆'.slice(0, 5 - review.rating)}
            </div>
            <p>{review.testimonial}</p>
          </article>
        ))}
      </div>

      {status === 'loading' ? <p className="testimonials-note">Loading live testimonials...</p> : null}
      {errorMessage ? <p className="testimonials-note">{errorMessage}</p> : null}

      {ratings.reviewSubmission && ratings.allowVisitorRatings ? (
        <form className="testimonial-form" onSubmit={handleSubmit}>
          <h3>Leave a Review</h3>
          <div className="testimonial-form-grid">
            <label>
              <span>Name</span>
              <input value={formValues.clientName} onChange={(event) => updateField('clientName', event.target.value)} />
            </label>
            <label>
              <span>Company</span>
              <input value={formValues.company} onChange={(event) => updateField('company', event.target.value)} />
            </label>
            <label>
              <span>Position</span>
              <input value={formValues.position} onChange={(event) => updateField('position', event.target.value)} />
            </label>
            <label>
              <span>Rating</span>
              <select value={formValues.rating} onChange={(event) => updateField('rating', event.target.value)}>
                {[5, 4, 3, 2, 1].map((value) => (
                  <option key={value} value={String(value)}>{value} stars</option>
                ))}
              </select>
            </label>
            <label className="testimonial-span-two">
              <span>Photo URL</span>
              <input value={formValues.clientPhoto} onChange={(event) => updateField('clientPhoto', event.target.value)} placeholder="Optional" />
            </label>
            <label className="testimonial-span-two">
              <span>Testimonial</span>
              <textarea value={formValues.testimonial} onChange={(event) => updateField('testimonial', event.target.value)} rows={5} />
            </label>
          </div>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      ) : (
        <p className="testimonials-note">Visitor review submissions are disabled for this deployment.</p>
      )}
    </section>
  );
}
