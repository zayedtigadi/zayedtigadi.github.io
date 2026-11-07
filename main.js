(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Nav shadow on scroll
  var nav = document.querySelector('.nav');
  function onScroll() {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (reduce) {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
    return;
  }

  // Staggered reveal
  var groups = new Map();
  document.querySelectorAll('.reveal').forEach(function (el) {
    var parent = el.parentElement;
    var n = groups.get(parent) || 0;
    el.style.transitionDelay = Math.min(n * 70, 420) + 'ms';
    groups.set(parent, n + 1);
  });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

  // 3D tilt on cards (fine pointers only)
  if (window.matchMedia('(pointer:fine)').matches) {
    document.querySelectorAll('.fleet-card, .card').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var rx = ((e.clientY - r.top) / r.height - 0.5) * -5;
        var ry = ((e.clientX - r.left) / r.width - 0.5) * 6;
        card.style.transform = 'perspective(900px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg) translateY(-4px)';
      });
      card.addEventListener('pointerleave', function () { card.style.transform = ''; });
    });
  }

  // Subtle hero parallax
  var heroBg = document.querySelector('.hero-bg');
  if (heroBg) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = Math.min(window.scrollY * 0.22, 160);
        heroBg.style.translate = '0 ' + y + 'px';
        ticking = false;
      });
    }, { passive: true });
  }
})();
