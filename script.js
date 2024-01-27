alert('Website under construction, Stay tuned for updates!');
var tl = gsap.timeline();

tl.from('h2 ', {
  y: -30,
  duration: 0.5,
  delay: 0.3,
  stagger: 0.3,
  opacity: 0,
});
tl.from('h1 ', {
  y: -30,
  duration: 0.5,
  delay: 0.3,
  stagger: 0.3,
  opacity: 0,
});
tl.from('p', {
  y: -30,
  duration: 0.5,
  delay: 0.3,
  stagger: 0.3,
  opacity: 0,
});
tl.from('h4 ', {
  y: -30,
  duration: 0.5,
  delay: 0.3,
  stagger: 0.3,
  opacity: 0,
});
tl.from('h6 ', {
  y: -30,
  duration: 0.8,
  delay: 0.3,
  stagger: 0.3,
  opacity: 0,
});
tl.from('h3', {
  x: -30,
  duration: 0.8,
  delay: 0.3,
  stagger: 0.3,
  opacity: 0,
});
tl.from('h5', {
  x: -30,
  duration: 0.8,
  delay: 0.3,
  stagger: 0.3,
  opacity: 0,
});

const hamburger = document.querySelector('.hamMenu');
const navMenu = document.querySelector('.navbar ul');

hamburger.addEventListener('click', mobileMenu);

function mobileMenu() {
  hamburger.classList.toggle('active');
  navMenu.classList.toggle('active');
}
const navLink = document.querySelectorAll('.navbar a');

navLink.forEach(n => n.addEventListener('click', closeMenu));

function closeMenu() {
  hamburger.classList.remove('active');
  navMenu.classList.remove('active');
}

const cursor = new MouseFollower({
  container: document.body,
  speed: 0.3,
});
