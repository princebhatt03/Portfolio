(function () {
  'use strict';

  let forms = document.querySelectorAll('.php-email-form');

  forms.forEach(function (e) {
    e.addEventListener('submit', function (event) {
      event.preventDefault();

      let thisForm = this;

      thisForm.querySelector('.loading').classList.add('d-block');
      thisForm.querySelector('.error-message').classList.remove('d-block');
      thisForm.querySelector('.sent-message').classList.remove('d-block');

      // Collect form data
      let formData = new FormData(thisForm);
      let formObject = {};
      formData.forEach((value, key) => (formObject[key] = value));

      // Use Email.js instead of PHP backend
      sendEmail(formObject, thisForm);
    });
  });

  function sendEmail(data, form) {
    const emailBody = `
      Name: ${data.name}<br>
      Email: ${data.email}<br>
      Subject: ${data.subject}<br>
      Message: ${data.message}
    `;

    Email.send({
      Host: 'smtp.elasticemail.com',
      Username: 'your-email@example.com',
      Password: 'your-smtp-password',
      To: 'recipient@example.com',
      From: 'your-email@example.com',
      Subject: data.subject || 'New Contact Form Submission',
      Body: emailBody,
    })
      .then(response => {
        form.querySelector('.loading').classList.remove('d-block');
        if (response === 'OK') {
          form.querySelector('.sent-message').classList.add('d-block');
          form.reset();
        } else {
          throw new Error('Email failed to send. Please try again.');
        }
      })
      .catch(error => {
        displayError(form, error.message || error);
      });
  }

  function displayError(form, error) {
    form.querySelector('.loading').classList.remove('d-block');
    form.querySelector('.error-message').innerHTML = error;
    form.querySelector('.error-message').classList.add('d-block');
  }
})();
