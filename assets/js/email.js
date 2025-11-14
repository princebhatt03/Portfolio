function sendEmail(event) {
  event.preventDefault();
  document.querySelector('.loading').style.display = 'block';

  let parms = {
    name: document.getElementById('uname').value,
    email: document.getElementById('email').value,
    subject: document.getElementById('subject').value,
    message: document.getElementById('msg').value,
  };

  // 1️⃣ Send email to YOU (admin notification)
  emailjs
    .send('service_35hnrju', 'template_rwyib0p', parms)
    .then(() => {
      // 2️⃣ Send auto-reply to USER
      return emailjs.send('service_35hnrju', 'template_m412l3f', {
        to_name: parms.name,
        to_email: parms.email,
        user_message: parms.message,
      });
    })
    .then(() => {
      document.querySelector('.loading').style.display = 'none';
      Swal.fire({
        icon: 'success',
        title: 'Email Sent!',
        text: 'Your email has been successfully sent',
      });
    })
    .catch(error => {
      document.querySelector('.loading').style.display = 'none';
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: `Failed to send the email. Error: ${error.text}`,
      });
    });
}
