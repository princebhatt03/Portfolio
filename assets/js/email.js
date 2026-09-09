// Contact form. Two cheap bot defences before anything is sent, because each
// submission costs two EmailJS sends (notification + auto-reply) from a
// monthly quota: a honeypot field a human never sees, and a minimum
// time-on-form, since bots fill and submit almost instantly.

const MIN_SECONDS_ON_FORM = 3;
const formLoadedAt = Date.now();

function sendEmail(event) {
  event.preventDefault();

  const form = event.target;
  const loading = document.querySelector('.loading');
  const submitBtn = form.querySelector('button[type="submit"]');

  // Honeypot: hidden from people, irresistible to bots.
  if (form.querySelector('#website')?.value) return;

  // Too fast to have been typed by a person.
  if ((Date.now() - formLoadedAt) / 1000 < MIN_SECONDS_ON_FORM) return;

  // The library may never have loaded (blocked CDN, offline). Say so plainly
  // instead of throwing a ReferenceError into the console.
  if (typeof emailjs === 'undefined') {
    Swal.fire({
      icon: 'error',
      title: "Couldn't send that",
      text: 'The mail service is unavailable right now. Please email princebhatt316@gmail.com directly.',
    });
    return;
  }

  const params = {
    name: document.getElementById('uname').value,
    email: document.getElementById('email').value,
    subject: document.getElementById('subject').value,
    message: document.getElementById('msg').value,
  };

  loading.style.display = 'block';
  if (submitBtn) submitBtn.disabled = true;

  const finish = () => {
    loading.style.display = 'none';
    if (submitBtn) submitBtn.disabled = false;
  };

  // 1. Notify me
  emailjs
    .send('service_35hnrju', 'template_rwyib0p', params)
    .then(() =>
      // 2. Auto-reply to the sender
      emailjs.send('service_35hnrju', 'template_m412l3f', {
        to_name: params.name,
        to_email: params.email,
        user_message: params.message,
      })
    )
    .then(() => {
      finish();
      form.reset();
      Swal.fire({
        icon: 'success',
        title: 'Message sent',
        text: "Thanks for reaching out — I'll get back to you soon.",
      });
    })
    .catch(error => {
      finish();
      console.error('EmailJS send failed:', error);
      Swal.fire({
        icon: 'error',
        title: "Couldn't send that",
        text: 'Something went wrong on the way out. Email me directly at princebhatt316@gmail.com and I\'ll reply.',
      });
    });
}
