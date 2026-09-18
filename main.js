const now = new Date();
const hour = now.getHours();
const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

const heroEyebrow = document.querySelector('.hero-card .eyebrow');
if (heroEyebrow) {
  heroEyebrow.textContent = greeting;
}

const promptButtons = document.querySelectorAll('.prompt-item');
promptButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const previous = button.textContent;
    button.textContent = 'Prompt selected';

    window.setTimeout(() => {
      button.textContent = previous;
    }, 1200);
  });
});
