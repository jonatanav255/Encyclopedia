const ATTACHED = 'data-copy-attached';

export function attachCopyButtons(root: HTMLElement | Document = document) {
  const pres = root.querySelectorAll<HTMLPreElement>('pre');
  pres.forEach((pre) => {
    if (pre.hasAttribute(ATTACHED)) return;
    pre.setAttribute(ATTACHED, 'true');
    if (getComputedStyle(pre).position === 'static') {
      pre.style.position = 'relative';
    }

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Copy code');
    btn.className = [
      'copy-btn',
      'absolute top-2 right-2 z-10',
      'rounded-md px-2 py-1 text-xs font-medium',
      'bg-zinc-800 hover:bg-zinc-700 text-zinc-100',
      'border border-zinc-600',
    ].join(' ');
    btn.textContent = 'Copy';

    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const code = pre.querySelector('code');
      const text = code ? code.innerText : pre.innerText;
      try {
        await navigator.clipboard.writeText(text);
        btn.textContent = 'Copied!';
        btn.classList.add('is-active');
        setTimeout(() => {
          btn.textContent = 'Copy';
          btn.classList.remove('is-active');
        }, 1200);
      } catch {
        btn.textContent = 'Failed';
        setTimeout(() => (btn.textContent = 'Copy'), 1200);
      }
    });

    pre.appendChild(btn);
  });
}
