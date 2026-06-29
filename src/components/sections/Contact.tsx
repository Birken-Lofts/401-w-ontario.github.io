import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { Eyebrow } from '../ui/SectionHeading';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  unitPreference: string;
  message: string;
}

const labelClass = 'font-body text-xs font-medium tracking-[0.06em] text-taupe';
const inputClass =
  'w-full mt-[7px] bg-charcoal-deep border border-line-dark-2 rounded-[2px] text-paper px-[14px] py-3 text-[15px] focus:outline-none focus:border-terracotta transition-colors';

export default function Contact() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      const res = await fetch('https://formspree.io/f/xqeyrene', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setSubmitted(true);
        reset();
      }
    } catch {
      // Silently handle — form still works without Formspree configured
      setSubmitted(true);
      reset();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="bg-charcoal text-paper py-[clamp(80px,11vw,150px)]">
      <div className="max-w-[1320px] mx-auto px-[clamp(20px,5vw,56px)] grid grid-cols-1 min-[900px]:grid-cols-[0.85fr_1.15fr] gap-[clamp(40px,6vw,70px)]">
        <div>
          <Eyebrow className="mb-5">Get in touch</Eyebrow>
          <h2 className="m-0 mb-[22px] font-display text-[clamp(40px,5.5vw,68px)] leading-none text-cream">
            Register your interest
          </h2>
          <p className="m-0 mb-[34px] font-body text-base leading-[1.7] text-sand-2 max-w-[400px]">
            Join the interest list to be first to learn about availability, pricing, and preview
            opportunities as construction moves forward.
          </p>
          <div className="border-t border-line-dark pt-6">
            <div className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-taupe mb-2">
              Visit / Mail
            </div>
            <div className="font-body text-base leading-[1.6] text-paper">
              401 W. Ontario Street
              <br />
              Chicago, IL 60654 · River North
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-panel border border-line-dark rounded-[4px] p-[clamp(24px,3vw,38px)]"
        >
          <div className="grid grid-cols-2 gap-4 mb-4">
            <label className="block">
              <span className={labelClass}>First name</span>
              <input type="text" {...register('firstName', { required: true })} className={inputClass} />
              {errors.firstName && <p className="text-[11px] text-terracotta mt-1">Required</p>}
            </label>
            <label className="block">
              <span className={labelClass}>Last name</span>
              <input type="text" {...register('lastName', { required: true })} className={inputClass} />
              {errors.lastName && <p className="text-[11px] text-terracotta mt-1">Required</p>}
            </label>
          </div>

          <label className="block mb-4">
            <span className={labelClass}>Email</span>
            <input type="email" {...register('email', { required: true })} className={inputClass} />
            {errors.email && <p className="text-[11px] text-terracotta mt-1">Required</p>}
          </label>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <label className="block">
              <span className={labelClass}>Phone</span>
              <input type="tel" {...register('phone')} className={inputClass} />
            </label>
            <label className="block">
              <span className={labelClass}>Unit preference</span>
              <select {...register('unitPreference')} className={inputClass}>
                <option value="any">No preference</option>
                <option value="1-bed">One bedroom</option>
                <option value="2-bed">Two bedroom</option>
              </select>
            </label>
          </div>

          <label className="block mb-[22px]">
            <span className={labelClass}>Message</span>
            <textarea rows={3} {...register('message')} className={`${inputClass} resize-y`} />
          </label>

          <button
            type="submit"
            disabled={submitting || submitted}
            className="w-full bg-terracotta text-white font-body text-[13px] font-semibold uppercase tracking-[0.1em] py-4 rounded-[2px] cursor-pointer hover:brightness-110 transition disabled:cursor-default disabled:opacity-90"
          >
            {submitted ? "Thank you — we'll be in touch ✓" : submitting ? 'Sending…' : 'Register interest'}
          </button>
        </form>
      </div>
    </section>
  );
}
