// alert('Website under construction, Stay tuned for updates!');
// var tl = gsap.timeline();

// tl.from('h2 ', {
//   y: -30,
//   duration: 0.5,
//   delay: 0.3,
//   stagger: 0.3,
//   opacity: 0,
// });
// tl.from('h1 ', {
//   y: -30,
//   duration: 0.5,
//   delay: 0.3,
//   stagger: 0.3,
//   opacity: 0,
// });
// tl.from('p', {
//   y: -30,
//   duration: 0.5,
//   delay: 0.3,
//   stagger: 0.3,
//   opacity: 0,
// });
// tl.from('h4 ', {
//   y: -30,
//   duration: 0.5,
//   delay: 0.3,
//   stagger: 0.3,
//   opacity: 0,
// });
// tl.from('h6 ', {
//   y: -30,
//   duration: 0.8,
//   delay: 0.3,
//   stagger: 0.3,
//   opacity: 0,
// });
// tl.from('h3', {
//   x: -30,
//   duration: 0.8,
//   delay: 0.3,
//   stagger: 0.3,
//   opacity: 0,
// });
// tl.from('h5', {
//   x: -30,
//   duration: 0.8,
//   delay: 0.3,
//   stagger: 0.3,
//   opacity: 0,
// });

const hamburger = document.querySelector('.hamMenu');
const navMenu = document.querySelector('#navbar ul');

hamburger.addEventListener('click', mobileMenu);

function mobileMenu() {
  hamburger.classList.toggle('active');
  navMenu.classList.toggle('active');
}
const navLink = document.querySelectorAll('#navbar a');

navLink.forEach(n => n.addEventListener('click', closeMenu));

function closeMenu() {
  hamburger.classList.remove('active');
  navMenu.classList.remove('active');
}

const navigation = document.querySelector('#navbar');
const navHeight = navigation.offsetHeight;
document.documentElement.style.setProperty(
  '--scroll-padding',
  navHeight + 'px'
);

let btn1 = document.querySelector('#btn1');
btn1.addEventListener('click', function open1() {
  window.location.href = 'https://github.com/princebhatt03';
});

let btn2 = document.querySelector('#btn2');
btn2.addEventListener('click', function open2() {
  window.location.href = 'https://github.com/princebhatt03';
});

let btn4 = document.querySelector('#btn4');
btn4.addEventListener('click', function open3() {
  window.location.href = 'https://wa.me/916265307739';
});

var data = anychart.data.set([
  ['JavaScript', 34],
  ['Java', 21],
  ['HTML, CSS', 15],
  ['Running Projects', 11],
  ['MERN Stack', 6],
  ['Others', 13],
]);
var chart = anychart.pie(data);
chart.innerRadius('55%');
chart.title('My Skills');
chart.container('container');
chart.draw();

let popup = document.getElementById('popup');
function openPopup() {
  popup.classList.add('open-popUp');
}
function closePopup() {
  popup.classList.remove('open-popUp');
}

// function enableSubmit() {
//   let inputs = document.getElementsByClassName('req');
//   let formBtn = document.querySelector('#formBtn');
//   let invalid = true;
//   for (var i = 0; i < inputs.length; i++) {
//     let changedInput = inputs[i];
//     if (changedInput.value.trim() === '' || changedInput.value === null) {
//       invalid = false;
//       break;
//     }
//   }
//   formBtn.disabled = !invalid;
// }
