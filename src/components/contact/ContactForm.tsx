import { useMemo, useState, type FormEvent } from 'react';
import { logPortfolioEvent } from '../../lib/supabase';

type ContactFormProps = {
  endpoint?: string;
  successMessage: string;
  errorMessage: string;
  minMessageLength: number;
};

type FormState = {
  name: string;
  email: string;
  subject: string;
  message: string;
  company: string;
};

const initialState: FormState = {
  name: '',
  email: '',
  subject: '',
  message: '',
  company: ''
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function ContactForm({ endpoint, successMessage, errorMessage, minMessageLength }: ContactFormProps) {
  const [values, setValues] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState | 'form', string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const canSubmit = useMemo(() => Boolean(endpoint), [endpoint]);

  const updateField = (field: keyof FormState, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const validate = () => {
    const nextErrors: Partial<Record<keyof FormState | 'form', string>> = {};

    if (!values.name.trim()) nextErrors.name = 'Name is required.';
    if (!values.email.trim()) nextErrors.email = 'Email is required.';
    else if (!isValidEmail(values.email.trim())) nextErrors.email = 'Enter a valid email address.';
    if (!values.subject.trim()) nextErrors.subject = 'Subject is required.';
    if (values.message.trim().length < minMessageLength) {
      nextErrors.message = `Message must be at least ${minMessageLength} characters.`;
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('idle');

    if (!validate()) return;
    if (!endpoint) {
      setErrors({ form: 'Configure PUBLIC_FORMSPREE_ENDPOINT to enable form submission.' });
      setStatus('error');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          subject: values.subject,
          message: values.message,
          company: values.company,
          _replyto: values.email
        })
      });

      if (!response.ok) {
        throw new Error('Form submission failed.');
      }

      setValues(initialState);
      setStatus('success');
      setErrors({});
      void logPortfolioEvent('contact_submit', { source: 'contact-form', subject: values.subject });
    } catch (error) {
      setStatus('error');
      setErrors({ form: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      {!canSubmit ? (
        <p className="contact-config-note">
          Configure <strong>PUBLIC_FORMSPREE_ENDPOINT</strong> to activate outbound form submissions.
        </p>
      ) : null}

      <div className="contact-field-grid">
        <label>
          <span>Name</span>
          <input value={values.name} onChange={(event) => updateField('name', event.target.value)} type="text" autoComplete="name" />
          {errors.name ? <small>{errors.name}</small> : null}
        </label>
        <label>
          <span>Email</span>
          <input value={values.email} onChange={(event) => updateField('email', event.target.value)} type="email" autoComplete="email" />
          {errors.email ? <small>{errors.email}</small> : null}
        </label>
        <label>
          <span>Subject</span>
          <input value={values.subject} onChange={(event) => updateField('subject', event.target.value)} type="text" />
          {errors.subject ? <small>{errors.subject}</small> : null}
        </label>
        <label>
          <span>Company</span>
          <input value={values.company} onChange={(event) => updateField('company', event.target.value)} type="text" />
        </label>
      </div>

      <label className="contact-message-field">
        <span>Message</span>
        <textarea
          value={values.message}
          onChange={(event) => updateField('message', event.target.value)}
          rows={7}
        />
        {errors.message ? <small>{errors.message}</small> : null}
      </label>

      <input type="text" name="website" className="contact-honeypot" tabIndex={-1} autoComplete="off" aria-hidden="true" />

      {errors.form ? <p className="contact-form-error">{errors.form}</p> : null}
      {status === 'success' ? <p className="contact-form-success">{successMessage}</p> : null}

      <button type="submit" className="contact-submit" disabled={isSubmitting || !canSubmit}>
        {isSubmitting ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
}
