/**
 * Portfolio AI assistant.
 *
 * The backend replies with Server-Sent Events: one `data:` frame per model
 * chunk, terminated by a `[DONE]` frame. Tokens are appended to the bubble as
 * they arrive, so what you see is the model actually generating, not a
 * pre-recorded string being replayed.
 *
 * All message text goes in via textContent — never innerHTML — so a reply
 * containing < or & renders literally instead of as markup.
 */
(function () {
  'use strict';

  const BACKEND_URL = 'https://portfolio-backend-six-puce.vercel.app/api/chat';
  const CONTACT_EMAIL = 'princebhatt316@gmail.com';

  const chatToggle = document.getElementById('chat-toggle');
  const chatBox = document.getElementById('chat-box');
  const closeChat = document.getElementById('close-chat');
  const sendBtn = document.getElementById('send-btn');
  const userInput = document.getElementById('user-input');
  const messages = document.getElementById('messages');
  const stopBtn = document.getElementById('stop-btn');

  if (!chatToggle || !chatBox || !messages) return;

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  let typingBubble = null;
  let abortController = null;
  let stopTyping = false;
  let greeted = false;

  /* ------------------------------------------------------------------ */
  /* Bubbles                                                             */
  /* ------------------------------------------------------------------ */

  function createBubble(sender, type = 'secondary') {
    const row = document.createElement('div');
    row.className = `mb-2 ${sender === 'You' ? 'text-end' : 'text-start'}`;

    const bubble = document.createElement('div');
    bubble.className = `chat-bubble bg-${type}`;

    const label = document.createElement('strong');
    label.textContent = `${sender}:`;
    bubble.appendChild(label);
    bubble.appendChild(document.createElement('br'));

    const body = document.createElement('span');
    bubble.appendChild(body);

    row.appendChild(bubble);
    messages.appendChild(row);
    messages.scrollTop = messages.scrollHeight;
    return body;
  }

  function appendMessage(sender, text, type = 'secondary') {
    createBubble(sender, type).textContent = text;
    messages.scrollTop = messages.scrollHeight;
  }

  async function typeText(sender, text) {
    stopTyping = false;
    const body = createBubble(sender);
    if (prefersReducedMotion) {
      body.textContent = text;
      return;
    }
    for (let i = 0; i < text.length; i++) {
      if (stopTyping) break;
      body.textContent += text[i];
      messages.scrollTop = messages.scrollHeight;
      await new Promise(r => setTimeout(r, 10));
    }
    if (stopTyping) body.textContent = text;
  }

  function showTypingBubble() {
    typingBubble = document.createElement('div');
    typingBubble.className = 'mb-2 text-start';

    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble bg-light text-dark';

    const label = document.createElement('strong');
    label.textContent = "Prince's AI Assistant:";
    bubble.appendChild(label);
    bubble.appendChild(document.createElement('br'));

    const em = document.createElement('em');
    em.textContent = 'Generating response';
    const dots = document.createElement('span');
    em.appendChild(dots);
    bubble.appendChild(em);

    typingBubble.appendChild(bubble);
    messages.appendChild(typingBubble);
    messages.scrollTop = messages.scrollHeight;

    let count = 0;
    typingBubble.interval = setInterval(() => {
      count = (count + 1) % 4;
      dots.textContent = '.'.repeat(count);
    }, 500);
  }

  function removeTypingBubble() {
    if (!typingBubble) return;
    clearInterval(typingBubble.interval);
    typingBubble.remove();
    typingBubble = null;
  }

  /* ------------------------------------------------------------------ */
  /* Local knowledge                                                     */
  /* ------------------------------------------------------------------ */

  // assets/js/knowledge.js answers from assets/data/profile.json +
  // projects.json. It handles the questions people actually ask — experience,
  // stack, projects, contact — instantly, with no API call and no Gemini
  // quota, and stays correct even if the backend is down or hasn't been
  // redeployed. Anything it can't confidently match falls through to the
  // model, whose system prompt carries the same facts.
  const KB = window.PortfolioKnowledge || null;
  const localAnswer = text => {
    try {
      return KB ? KB.answer(text) : null;
    } catch (e) {
      console.warn('Knowledge lookup failed:', e);
      return null;
    }
  };

  /* ------------------------------------------------------------------ */
  /* Streaming                                                           */
  /* ------------------------------------------------------------------ */

  const FALLBACK = `Sorry — I can't reach the assistant right now. Email Prince at ${CONTACT_EMAIL} and he'll reply himself.`;

  async function streamReply(message) {
    abortController = new AbortController();
    let body = null;

    const write = text => {
      if (!body) {
        removeTypingBubble();
        body = createBubble('Assistant');
      }
      body.textContent += text;
      messages.scrollTop = messages.scrollHeight;
    };

    try {
      const res = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
        signal: abortController.signal,
      });

      if (!res.ok || !res.body) {
        write(FALLBACK);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let split;
        while ((split = buffer.indexOf('\n\n')) !== -1) {
          const frame = buffer.slice(0, split);
          buffer = buffer.slice(split + 2);
          if (!frame.startsWith('data: ')) continue;

          const payload = frame.slice(6);
          if (payload === '[DONE]') return;
          if (payload === '[ERROR]') {
            write(' …something went wrong on my end. Try again?');
            return;
          }
          write(payload);
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        if (body) body.textContent += ' …stopped.';
        return;
      }
      console.error('Chat request failed:', err);
      write(FALLBACK);
    } finally {
      removeTypingBubble();
    }
  }

  /* ------------------------------------------------------------------ */
  /* Sending                                                             */
  /* ------------------------------------------------------------------ */

  async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    appendMessage('You', text, 'primary');
    userInput.value = '';
    userInput.disabled = true;
    sendBtn.disabled = true;
    stopBtn.style.display = 'block';

    showTypingBubble();

    const known = localAnswer(text);
    if (known) {
      removeTypingBubble();
      await typeText('Assistant', known);
    } else {
      await streamReply(text);
    }

    userInput.disabled = false;
    sendBtn.disabled = false;
    stopBtn.style.display = 'none';
    userInput.focus();
  }

  function stopResponding() {
    if (abortController) abortController.abort();
    stopTyping = true;
    removeTypingBubble();
    stopBtn.style.display = 'none';
  }

  async function greet() {
    if (KB && KB.ready) KB.ready.catch(() => {});
    await typeText('Assistant', '👋 Hello!');
    await new Promise(r => setTimeout(r, 400));
    await typeText(
      'Assistant',
      'Ask me about Prince’s experience, stack, projects or how to reach him.'
    );
  }

  /* ------------------------------------------------------------------ */
  /* Open / close                                                        */
  /* ------------------------------------------------------------------ */

  function openChat() {
    chatBox.classList.remove('d-none');
    chatToggle.classList.add('d-none');
    // The panel fills this corner; the mail and back-to-top buttons in the
    // rail below it step aside while it is open.
    document.body.classList.add('chat-open');
    if (!greeted) {
      greeted = true;
      greet();
    }
    userInput.focus();
  }

  function closeChatBox() {
    chatBox.classList.add('d-none');
    chatToggle.classList.remove('d-none');
    document.body.classList.remove('chat-open');
    chatToggle.focus(); // return focus where it came from
    // Transcript is deliberately kept, so reopening doesn't lose the thread.
  }

  chatToggle.addEventListener('click', openChat);
  closeChat.addEventListener('click', closeChatBox);
  sendBtn.addEventListener('click', sendMessage);
  stopBtn.addEventListener('click', stopResponding);

  userInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !chatBox.classList.contains('d-none')) {
      closeChatBox();
    }
  });

  document.querySelectorAll('#suggestions button').forEach(button => {
    button.addEventListener('click', () => {
      userInput.value = button.textContent.trim();
      sendMessage();
    });
  });

  /* ------------------------------------------------------------------ */
  /* Hint bubbles                                                        */
  /* ------------------------------------------------------------------ */

  window.addEventListener('load', () => {
    // Both bubbles used to appear at the same moment, stacked on top of each
    // other over the hero. They now run as a queue: one shows, auto-retires,
    // then the next. Dismissing one skips straight to the next.
    const QUEUE = [
      { hint: 'chat-hint', close: 'close-hint', delay: 3500, life: 7000 },
      { hint: 'contact-hint', close: 'close-contact-hint', delay: 900, life: 7000 },
    ];

    let cancelled = false;

    const hideAll = () => {
      QUEUE.forEach(({ hint }) => {
        const el = document.getElementById(hint);
        if (el) el.style.display = 'none';
      });
    };

    // Opening the chat retires the whole queue
    new MutationObserver(() => {
      if (!chatBox.classList.contains('d-none')) {
        cancelled = true;
        hideAll();
      }
    }).observe(chatBox, { attributes: true, attributeFilter: ['class'] });

    const showNext = i => {
      if (cancelled || i >= QUEUE.length) return;
      const { hint, close, delay, life } = QUEUE[i];
      const el = document.getElementById(hint);
      const btn = document.getElementById(close);
      if (!el) return showNext(i + 1);

      setTimeout(() => {
        if (cancelled || !chatBox.classList.contains('d-none')) return;
        el.style.display = 'block';

        let done = false;
        const retire = skipRest => {
          if (done) return;
          done = true;
          el.style.display = 'none';
          if (skipRest) cancelled = true;
          else showNext(i + 1);
        };

        if (btn) btn.addEventListener('click', () => retire(true));
        setTimeout(() => retire(false), life);
      }, delay);
    };

    showNext(0);

    const contactBtn = document.getElementById('contact-toggle');
    const contactHint = document.getElementById('contact-hint');
    if (contactBtn) {
      contactBtn.addEventListener('click', e => {
        e.preventDefault();
        if (contactHint) contactHint.style.display = 'none';

        // Below the lg breakpoint the two contact columns stack, so scrolling
        // to #contact lands on the address card and the form — the thing the
        // button is actually for — is another screen down. Go straight to the
        // form there. On wide screens the columns sit side by side, so the
        // section top already shows the form.
        const stacked = window.matchMedia('(max-width: 991.98px)').matches;
        const target =
          (stacked && document.getElementById('contact-form')) ||
          document.getElementById('contact');
        if (!target) return;

        target.scrollIntoView({
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
          block: 'start',
        });

        // Move keyboard focus to the first field so the button actually
        // starts the task, not just the scroll.
        const first = document.getElementById('uname');
        if (first) {
          const focus = () => first.focus({ preventScroll: true });
          if (prefersReducedMotion) focus();
          else setTimeout(focus, 700);
        }
      });
    }
  });
})();
