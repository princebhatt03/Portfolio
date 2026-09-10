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

  /**
   * Typing animation.
   *
   * Characters go in a few at a time on a fixed frame rather than one per
   * tick — one-at-a-time made anything longer than a sentence crawl. The
   * chunk grows with the length of the text, so the whole animation lands
   * inside TYPE_MAX_MS however much the model sent back: a short answer
   * still types visibly, a long one doesn't keep the visitor waiting.
   */
  const TYPE_TICK = 12; // ms between frames
  const TYPE_MIN_CHARS = 3; // characters per frame, floor
  const TYPE_MAX_MS = 2600; // ceiling on the whole animation

  async function typeInto(body, text) {
    stopTyping = false;

    if (prefersReducedMotion) {
      body.textContent = text;
      messages.scrollTop = messages.scrollHeight;
      return;
    }

    const frames = Math.max(1, Math.floor(TYPE_MAX_MS / TYPE_TICK));
    const step = Math.max(TYPE_MIN_CHARS, Math.ceil(text.length / frames));

    for (let i = 0; i < text.length; i += step) {
      if (stopTyping) break;
      body.textContent += text.slice(i, i + step);
      messages.scrollTop = messages.scrollHeight;
      await new Promise(r => setTimeout(r, TYPE_TICK));
    }

    // Stopped part-way: drop the rest in rather than leaving a half sentence.
    if (stopTyping) {
      body.textContent = text;
      messages.scrollTop = messages.scrollHeight;
    }
  }

  async function typeText(sender, text) {
    await typeInto(createBubble(sender), text);
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

  /**
   * The endpoint has shipped in two shapes: Server-Sent Events (`data: …`
   * frames closed by `[DONE]`) and a single JSON body, `{ "reply": "…" }`.
   * Reading an SSE stream out of a JSON body finds no frames at all — the
   * loop drains the body, matches nothing, and returns having drawn no
   * bubble, which is how a request that succeeded on the network tab still
   * showed an empty panel. Pick the reader by Content-Type and handle both.
   */

  /** Pull the answer out of whichever field the JSON happens to use. */
  function replyFrom(payload) {
    if (typeof payload === 'string') return payload;
    if (!payload || typeof payload !== 'object') return '';
    const keys = ['reply', 'response', 'answer', 'text', 'message', 'content', 'output'];
    for (const k of keys) {
      if (typeof payload[k] === 'string' && payload[k].trim()) return payload[k];
    }
    return '';
  }

  /**
   * The model answers in Markdown. Bubbles are plain text on purpose — never
   * innerHTML — so `**Indian**` would otherwise arrive with its asterisks
   * showing. Drop the emphasis markers instead of rendering markup.
   */
  function tidy(text) {
    return String(text)
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/__(.+?)__/g, '$1')
      .replace(/^[ \t]*[*-][ \t]+/gm, '• ')
      .trim();
  }

  async function streamReply(message) {
    abortController = new AbortController();
    let body = null;
    let wrote = false;
    let aborted = false;

    const open = () => {
      if (!body) {
        removeTypingBubble();
        body = createBubble('Assistant');
      }
      return body;
    };

    const write = text => {
      if (!text) return;
      open().textContent += text;
      wrote = true;
      messages.scrollTop = messages.scrollHeight;
    };

    try {
      const res = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
        signal: abortController.signal,
      });

      if (!res.ok) {
        // Show the server's own explanation where there is one — a 429 says
        // how long to wait, and the generic fallback used to swallow it.
        let reason = '';
        try {
          const payload = await res.json();
          reason = (payload && payload.error) || replyFrom(payload);
        } catch (e) {
          /* not JSON — fall through to the generic message */
        }
        write(reason ? tidy(reason) : FALLBACK);
        return;
      }

      const contentType = (res.headers.get('Content-Type') || '').toLowerCase();

      // --- Non-streaming backend: the whole answer in one body ---
      if (!contentType.includes('text/event-stream')) {
        const raw = await res.text();
        let text = raw;
        try {
          // A JSON body with no answer field in it is not something to show a
          // visitor raw — leave the text empty and let the fallback below
          // speak instead.
          text = replyFrom(JSON.parse(raw));
        } catch (e) {
          /* not JSON — a plain-text reply, use it as it came */
        }

        text = tidy(text);
        if (text) {
          // The whole answer arrives at once here, but dropping a paragraph
          // into the panel in a single frame reads nothing like the streamed
          // replies or the local ones. Type it in, same as those.
          wrote = true;
          await typeInto(open(), text);
        }
        return;
      }

      // --- Streaming backend: one `data:` frame per model chunk ---
      if (!res.body) {
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
        aborted = true;
        if (body) body.textContent += ' …stopped.';
        return;
      }
      console.error('Chat request failed:', err);
      write(FALLBACK);
    } finally {
      removeTypingBubble();
      // Last line of defence: a request that produced no text at all — an
      // unrecognised body shape, or a stream that closed before its first
      // frame — still gets an answer rather than an empty panel.
      if (!wrote && !aborted) write(FALLBACK);
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

  // The chips are labelled short so five of them fit without swallowing the
  // panel; data-message holds the question to send. Fall back to the label
  // for any chip that doesn't carry one.
  document.querySelectorAll('#suggestions button').forEach(button => {
    button.addEventListener('click', () => {
      const question = (button.dataset.message || button.textContent || '').trim();
      if (!question) return;
      userInput.value = question;
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
