'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';

interface FormData {
  name: string;
  email: string;
  phone: string;
  interest: string;
  message: string;
}

export default function Contact() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const onSubmit = async (data: FormData) => {
    try {
      const res = await fetch('https://formspree.io/f/xqeyrene', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
      });
      setStatus(res.ok ? 'success' : 'error');
    } catch {
      setStatus('error');
    }
  };

  return (
    <section id="contact" className="contact-section">
      <div className="contact-band section-shell">
        <div>
          <h2>Contact us</h2>
          <p className="contact-blurb">
            Interested in Birken Lofts? Tell us a bit about what you&rsquo;re looking for and
            we&rsquo;ll be in touch within a business day.
          </p>
          <p className="contact-address">
            401 W. Ontario Street
            <br />
            Chicago, IL 60654
          </p>
        </div>
        {status === 'success' ? (
          <p className="form-success">
            Thank you — your message is on its way. We&rsquo;ll be in touch within a business day.
          </p>
        ) : (
          <form className="contact-form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="field">
              <label htmlFor="contact-name">Name</label>
              <input id="contact-name" className="input" type="text" placeholder="Your name" {...register('name', { required: true })} />
            </div>
            <div className="field">
              <label htmlFor="contact-email">Email</label>
              <input id="contact-email" className="input" type="email" placeholder="you@email.com" {...register('email', { required: true, pattern: /^\S+@\S+\.\S+$/ })} />
            </div>
            <div className="field">
              <label htmlFor="contact-phone">Phone</label>
              <input id="contact-phone" className="input" type="tel" placeholder="(312) 555-0100" {...register('phone')} />
            </div>
            <div className="field">
              <label htmlFor="contact-interest">Interested in</label>
              <select id="contact-interest" className="input" defaultValue="" {...register('interest')}>
                <option value="" disabled>Select a residence</option>
                <option>Studio</option>
                <option>One bedroom</option>
                <option>Two bedroom</option>
                <option>Not sure yet</option>
              </select>
            </div>
            <div className="field full">
              <label htmlFor="contact-message">Message</label>
              <textarea id="contact-message" className="input" placeholder="Your message" {...register('message')} />
            </div>
            {(errors.name || errors.email) && (
              <p className="form-error">Please add your name and email so we can reach you.</p>
            )}
            {status === 'error' && (
              <p className="form-error">
                Something went wrong sending your message — please try again in a moment.
              </p>
            )}
            <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Sending…' : 'Send message'}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
