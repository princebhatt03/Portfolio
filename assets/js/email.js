function sendEmail(event) {
  event.preventDefault();
  document.querySelector('.loading').style.display = 'block';

  let parms = {
    name: document.getElementById('uname').value,
    email: document.getElementById('email').value,
    subject: document.getElementById('subject').value,
    message: document.getElementById('msg').value,
  };

  emailjs
    .send('service_pysqauc', 'template_rwyib0p', parms)
    .then(() => {
      document.querySelector('.loading').style.display = 'none';
      Swal.fire({
        icon: 'success',
        title: 'Email Sent!',
        text: 'Your email has been successfully sent.',
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
