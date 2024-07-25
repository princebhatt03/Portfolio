window.addEventListener('load', function () {
  var preloader = document.getElementById('preloader-active');
  setTimeout(function () {
    preloader.style.transition = 'opacity 0.6s';
    preloader.style.opacity = '0';
    preloader.addEventListener('transitionend', function () {
      preloader.style.display = 'none';
    });
  }, 450);
  setTimeout(function () {
    document.body.style.overflow = 'visible';
  }, 450);
});
new Swiper('.portfolio-details-slider', {
  speed: 400,
  loop: true,
  autoplay: {
    delay: 5000,
    disableOnInteraction: false,
  },
  pagination: {
    el: '.swiper-pagination',
    type: 'bullets',
    clickable: true,
  },
});
