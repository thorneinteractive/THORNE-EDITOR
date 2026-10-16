/* THORNE screenplay editor */
(() => {
  'use strict';
  const pagesContainer = document.getElementById('pages-container');
  const docTitle = document.getElementById('document-title');
  const wordCountEl = document.getElementById('word-count');
  const charCountEl = document.getElementById('char-count');
  const pageCountEl = document.getElementById('page-count');
  const saveStatusEl = document.getElementById('save-status');
  const statusDot = document.querySelector('.status-dot');
  const toastEl = document.getElementById('toast');
  const themeIcon = document.getElementById('theme-icon');
  const themeLabel = document.getElementById('theme-label');
  const types = ['sc-slugline','sc-action','sc-character','sc-parenthetical','sc-dialogue','sc-transition','sc-shot'];
  const labels = { 'sc-slugline':'SCENE HEADING','sc-action':'ACTION','sc-character':'CHARACTER','sc-parenthetical':'PARENTHETICAL','sc-dialogue':'DIALOGUE','sc-transition':'TRANSITION','sc-shot':'SHOT' };
  const nextOnEnter = { 'sc-slugline':'sc-action','sc-action':'sc-action','sc-character':'sc-dialogue','sc-parenthetical':'sc-dialogue','sc-dialogue':'sc-character','sc-transition':'sc-slugline','sc-shot':'sc-action' };
  let saveTimer, toastTimer, lastActivePaper = null;

  document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    pagesContainer.addEventListener('keydown', handleEditorKeys);
    pagesContainer.addEventListener('input', e => {
      normalizePaper(e.target.closest('.editor-paper'));
      requestAnimationFrame(paginate);
      updateGlobalStats();
      queueSave();
    });
    pagesContainer.addEventListener('click', () => setActiveToolbar());
    pagesContainer.addEventListener('focusin', e => { lastActivePaper = e.target.closest('.editor-paper'); });
    document.querySelector('.script-toolbar').addEventListener('mousedown', e => {
      if (e.target.closest('.tool-btn[data-format]')) e.preventDefault();
    });
    docTitle.addEventListener('input', queueSave);
    document.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); saveToLocalStorage(); }
      if (e.key === 'Escape' && document.body.classList.contains('focus-mode')) window.toggleFocusMode();
    });
    updateGlobalStats();
    requestAnimationFrame(paginate);
  });

  function currentBlock() {
    const sel = window.getSelection();
    if (!sel.rangeCount) return null;
    let n = sel.anchorNode;
    if (!n) return null;
    if (n.nodeType === Node.TEXT_NODE) n = n.parentElement;
    return n?.closest?.('.sc-slugline,.sc-action,.sc-character,.sc-parenthetical,.sc-dialogue,.sc-transition,.sc-shot') || null;
  }
  function activePaper() {
    const sel = window.getSelection();
    let n = sel?.anchorNode;
    if (n?.nodeType === Node.TEXT_NODE) n = n.parentElement;
    return n?.closest?.('.editor-paper') || (lastActivePaper?.isConnected ? lastActivePaper : [...document.querySelectorAll('.editor-paper')].at(-1));
  }
  function placeCaret(el, atEnd = false) {
    el.focus();
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(!atEnd);
    const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range);
  }
  function makeBlock(type, text = '') {
    const el = document.createElement('div');
    el.className = types.includes(type) ? type : 'sc-action';
    el.contentEditable = 'true';
    el.setAttribute('data-element', labels[el.className]);
    if (text) el.textContent = text;
    return el;
  }
  function normalizePaper(paper) {
    if (!paper) return;
    let openAction = null;
    [...paper.childNodes].forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        if (!node.textContent.trim()) { node.remove(); return; }
        if (!openAction) {
          openAction = makeBlock('sc-action');
          paper.insertBefore(openAction, node);
        }
        openAction.append(node);
        return;
      }
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      if (node.matches('.sc-slugline,.sc-action,.sc-character,.sc-parenthetical,.sc-dialogue,.sc-transition,.sc-shot')) {
        openAction = null;
        return;
      }
      if (node.tagName === 'BR') {
        if (!openAction) {
          openAction = makeBlock('sc-action');
          paper.insertBefore(openAction, node);
        }
        openAction.append(node);
        return;
      }
      node.className = 'sc-action';
      node.contentEditable = 'true';
      node.setAttribute('data-element', labels['sc-action']);
      openAction = null;
    });
  }
  function insertAfter(block, type, text = '') {
    const next = makeBlock(type, text);
    if (block?.parentNode) block.after(next);
    else (activePaper() || document.querySelector('.editor-paper')).append(next);
    placeCaret(next);
    updateGlobalStats(); queueSave(); setActiveToolbar();
    return next;
  }
  function paginate() {
    const papers = [...pagesContainer.querySelectorAll('.editor-paper')];
    for (let i = 0; i < papers.length; i++) {
      const paper = papers[i];
      const blocks = [...paper.children];
      const firstOverflow = blocks.findIndex(block => block.offsetTop + block.offsetHeight > paper.clientHeight);
      if (firstOverflow < 0 || (firstOverflow === 0 && blocks[0].offsetHeight > paper.clientHeight)) continue;
      let nextPaper = pagesContainer.children[i + 1]?.querySelector('.editor-paper');
      if (!nextPaper) {
        const page = makePage(i + 2);
        pagesContainer.insertBefore(page, pagesContainer.children[i + 1] || null);
        nextPaper = page.querySelector('.editor-paper');
      }
      blocks.slice(firstOverflow).reverse().forEach(block => nextPaper.prepend(block));
      requestAnimationFrame(paginate);
      return;
    }
    for (let i = papers.length - 2; i >= 0; i--) {
      const paper = papers[i];
      const nextPaper = papers[i + 1];
      if (nextPaper.closest('.script-page').dataset.manualPage === 'true') continue;
      const nextBlock = nextPaper.firstElementChild;
      if (!nextBlock) continue;
      paper.append(nextBlock);
      if (nextBlock.offsetTop + nextBlock.offsetHeight > paper.clientHeight) {
        nextPaper.prepend(nextBlock);
        continue;
      }
      requestAnimationFrame(paginate);
      return;
    }
    refreshPageNumbers();
  }
  function refreshPageNumbers() {
    [...pagesContainer.querySelectorAll('.script-page')].forEach((page, i) => {
      page.dataset.pageNumber = i + 1;
      page.querySelector('.page-header-label').textContent = `// PAGE ${String(i + 1).padStart(2, '0')}`;
    });
    updateGlobalStats();
  }
  function handleEditorKeys(e) {
    const paper = e.target.closest('.editor-paper');
    if (!paper) return;
    normalizePaper(paper);
    if (e.key === 'Tab') {
      e.preventDefault();
      const block = currentBlock();
      const current = types.indexOf(block?.className);
      const step = e.shiftKey ? -1 : 1;
      const nextType = types[(current + step + types.length) % types.length];
      if (block) block.className = nextType;
      else insertAfter(null, nextType);
      if (block) { block.setAttribute('data-element', labels[nextType]); setActiveToolbar(); updateGlobalStats(); queueSave(); }
      requestAnimationFrame(paginate);
      return;
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const block = currentBlock();
      const type = block?.className || 'sc-action';
      const sel = window.getSelection();
      if (!block || !sel.rangeCount) return insertAfter(block, nextOnEnter[type] || 'sc-action');
      const range = sel.getRangeAt(0);
      range.deleteContents();
      const after = range.cloneRange(); after.selectNodeContents(block); after.setStart(range.startContainer, range.startOffset); after.collapse(true);
      const tail = after.extractContents();
      block.after(makeBlock(nextOnEnter[type] || 'sc-action'));
      const next = block.nextElementSibling;
      next.append(tail);
      placeCaret(next);
      updateGlobalStats(); queueSave(); setActiveToolbar(); requestAnimationFrame(paginate);
    }
  }

  window.applyFormat = function(type) {
    const map = {slugline:'sc-slugline',action:'sc-action',character:'sc-character',parenthetical:'sc-parenthetical',dialogue:'sc-dialogue',transition:'sc-transition',shot:'sc-shot'};
    const block = currentBlock();
    if (block) { block.className = map[type] || 'sc-action'; block.setAttribute('data-element', labels[block.className]); placeCaret(block, true); updateGlobalStats(); queueSave(); setActiveToolbar(); requestAnimationFrame(paginate); }
    else insertAfter(null, map[type] || 'sc-action');
  };
  function setActiveToolbar() {
    const type = currentBlock()?.className;
    document.querySelectorAll('.tool-btn[data-format]').forEach(b => b.classList.toggle('active', b.dataset.format === type));
  }
  window.addNewPage = function() {
    const pageNum = pagesContainer.querySelectorAll('.script-page').length + 1;
    const page = document.createElement('div'); page.className = 'script-page'; page.dataset.pageNumber = pageNum; page.dataset.manualPage = 'true';
    const label = String(pageNum).padStart(2,'0');
    page.innerHTML = `<div class="page-header-label">// PAGE ${label}</div><div class="editor-paper" contenteditable="true" spellcheck="false" data-placeholder="Start writing on page ${pageNum}..."></div>`;
    pagesContainer.append(page); page.querySelector('.editor-paper').focus(); updateGlobalStats(); queueSave(); showToast(`ADDED PAGE ${label}`);
  };
  function updateGlobalStats() {
    const papers = [...document.querySelectorAll('.editor-paper')];
    const fullText = papers.map(p => p.innerText || '').join('\n');
    const words = fullText.trim() ? fullText.trim().split(/\s+/).length : 0;
    wordCountEl.textContent = `WORDS: ${words}`;
    charCountEl.textContent = `CHARACTERS: ${fullText.length}`;
    pageCountEl.textContent = `PAGES: ${papers.length}`;
    saveStatusEl.textContent = '// UNSAVED CHANGES'; statusDot.classList.add('saving');
  }
  function queueSave() { clearTimeout(saveTimer); saveTimer = setTimeout(() => saveToLocalStorage(true), 700); }
  window.toggleTheme = function() {
    const light = document.body.dataset.theme !== 'light';
    document.body.dataset.theme = light ? 'light' : 'dark';
    themeIcon.className = light ? 'fa-solid fa-moon' : 'fa-solid fa-circle-half-stroke';
    themeLabel.textContent = light ? 'LIGHT' : 'DARK';
    queueSave(); showToast(light ? 'LIGHT MODE ENABLED' : 'DARK MODE ENABLED');
  };
  window.saveToLocalStorage = function(isAuto = false) {
    try {
      localStorage.setItem('thorne_pro_doc', JSON.stringify({title:docTitle.value,theme:document.body.dataset.theme,html:pagesContainer.innerHTML}));
      saveStatusEl.textContent = isAuto ? '// AUTO-SAVED' : '// SAVED'; statusDot.classList.remove('saving');
    } catch (err) { saveStatusEl.textContent = '// SAVE ERROR'; }
  };
  function loadFromLocalStorage() {
    try {
      const data = JSON.parse(localStorage.getItem('thorne_pro_doc') || 'null');
      if (!data) return;
      if (data.title) docTitle.value = data.title;
      if (data.theme) document.body.dataset.theme = data.theme;
      if (data.html) pagesContainer.innerHTML = data.html;
      pagesContainer.querySelectorAll('.editor-paper').forEach(normalizePaper);
      syncTheme();
    } catch (err) { console.warn('Could not load the saved document.', err); }
  }
  function syncTheme() {
    const light = document.body.dataset.theme === 'light';
    themeIcon.className = light ? 'fa-solid fa-moon' : 'fa-solid fa-circle-half-stroke';
    themeLabel.textContent = light ? 'LIGHT' : 'DARK';
  }
  window.downloadFile = function() {
    const data = {title:docTitle.value,html:pagesContainer.innerHTML,timestamp:new Date().toISOString()};
    const blob = new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = (docTitle.value || 'screenplay').replace(/\.th$/i,'') + '.th'; a.click(); URL.revokeObjectURL(a.href); showToast('EXPORTED .TH FILE');
  };
  window.loadFile = function(event) {
    const file = event.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result || '');
        const data = /\.txt$/i.test(file.name) ? null : JSON.parse(text);
        if (data?.html) pagesContainer.innerHTML = data.html;
        else {
          pagesContainer.replaceChildren(makePage(1));
          const paper = pagesContainer.querySelector('.editor-paper');
          String(data?.text || text).replace(/\r/g, '').split('\n').forEach(line => paper.append(makeBlock('sc-action', line)));
        }
        if (data?.title) docTitle.value = data.title;
        updateGlobalStats(); requestAnimationFrame(paginate); saveToLocalStorage(); showToast('DOCUMENT OPENED');
      } catch { showToast('INVALID FILE'); }
      event.target.value = '';
    };
    reader.readAsText(file);
  };
  function makePage(num) { const page = document.createElement('div'); page.className='script-page'; page.dataset.pageNumber=num; page.innerHTML=`<div class="page-header-label">// PAGE ${String(num).padStart(2,'0')}</div><div class="editor-paper" contenteditable="true" spellcheck="false" data-placeholder="Start writing your screenplay..."></div>`; return page; }
  window.createNewDoc = function() { if (!confirm('Create a new document? The current text will be replaced.')) return; pagesContainer.replaceChildren(makePage(1)); docTitle.value='Untitled_Script.th'; updateGlobalStats(); saveToLocalStorage(); showToast('NEW DOCUMENT CREATED'); };
  window.clearDoc = function() { if (!confirm('Clear the entire document?')) return; pagesContainer.replaceChildren(makePage(1)); updateGlobalStats(); saveToLocalStorage(); showToast('DOCUMENT CLEARED'); };
  window.copyToClipboard = async function() {
    const text = [...document.querySelectorAll('.editor-paper')].map(p => [...p.children].map(b => b.innerText).join('\n')).join('\n\n');
    try { await navigator.clipboard.writeText(text); showToast('SCREENPLAY COPIED'); } catch { showToast('CLIPBOARD ACCESS DENIED'); }
  };
  window.toggleFocusMode = function() { document.body.classList.toggle('focus-mode'); showToast(document.body.classList.contains('focus-mode') ? 'FOCUS MODE ENABLED' : 'FOCUS MODE DISABLED'); };
  function showToast(message) { toastEl.textContent=`// ${message}`; toastEl.classList.add('show'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>toastEl.classList.remove('show'),2200); }
  window.showToast = showToast;
})();
