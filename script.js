/* THORNE screenplay editor */
(() => {
  'use strict';
  const pagesContainer = document.getElementById('pages-container');
  const docTitle = document.getElementById('document-title');
  const wordCountEl = document.getElementById('word-count');
  const charCountEl = document.getElementById('char-count');
  const pageCountEl = document.getElementById('page-count');
  const sceneCountEl = document.getElementById('scene-count');
  const runtimeEstimateEl = document.getElementById('runtime-estimate');
  const averageSceneEl = document.getElementById('average-scene');
  const activeSceneTimeEl = document.getElementById('active-scene-time');
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
    pagesContainer.addEventListener('beforeinput', prepareFirstBlock);
    pagesContainer.addEventListener('input', () => {
      requestAnimationFrame(paginate);
      updateGlobalStats();
      queueSave();
    });
    pagesContainer.addEventListener('click', () => { setActiveToolbar(); updateSceneStats(); });
    pagesContainer.addEventListener('focusin', e => { lastActivePaper = e.target.closest('.editor-paper'); updateSceneStats(); });
    document.querySelector('.script-toolbar').addEventListener('mousedown', e => {
      if (e.target.closest('.tool-btn[data-format]')) e.preventDefault();
    });
    docTitle.addEventListener('input', queueSave);
    document.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); saveToLocalStorage(); }
      if (e.key === 'Escape' && document.body.classList.contains('focus-mode')) window.toggleFocusMode();
    });
    document.addEventListener('selectionchange', () => {
      if (document.activeElement?.closest?.('.editor-paper')) updateSceneStats();
    });
    updateGlobalStats();
    requestAnimationFrame(paginate);
    queueSave();
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
  function caretOffsetInBlock(block) {
    const selection = window.getSelection();
    if (!block || !selection.rangeCount) return null;
    const range = selection.getRangeAt(0);
    if (range.startContainer !== block && !block.contains(range.startContainer)) return null;
    const before = range.cloneRange();
    before.selectNodeContents(block);
    before.setEnd(range.startContainer, range.startOffset);
    return before.toString().length;
  }
  function restoreCaretInBlock(block, offset) {
    if (!block) return;
    block.focus();
    const range = document.createRange();
    let remaining = offset ?? block.innerText.length;
    const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node) {
      if (remaining <= node.textContent.length) {
        range.setStart(node, remaining);
        range.collapse(true);
        const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range);
        block.scrollIntoView({ block: 'center', inline: 'nearest' });
        return;
      }
      remaining -= node.textContent.length;
      node = walker.nextNode();
    }
    placeCaret(block, true);
    block.scrollIntoView({ block: 'center', inline: 'nearest' });
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
    repairFragmentedActions(paper);
  }
  function repairFragmentedActions(paper) {
    let fragments = [];
    const mergeFragments = () => {
      if (fragments.length >= 3) {
        const [first, ...rest] = fragments;
        first.textContent = fragments.map(block => block.innerText).join('');
        rest.forEach(block => block.remove());
      }
      fragments = [];
    };
    [...paper.children].forEach(block => {
      const isSingleCharacterAction = block.classList.contains('sc-action')
        && block.children.length === 0
        && block.innerText.trim().length === 1;
      if (isSingleCharacterAction) fragments.push(block);
      else mergeFragments();
    });
    mergeFragments();
  }
  function prepareFirstBlock(e) {
    const paper = e.target.closest('.editor-paper');
    if (!paper || currentBlock()) return;
    const supportedInputs = ['insertText', 'insertCompositionText', 'insertFromPaste', 'insertParagraph', 'insertLineBreak'];
    if (!supportedInputs.includes(e.inputType)) return;
    e.preventDefault();
    const text = e.data ?? e.dataTransfer?.getData('text/plain') ?? '';
    const lines = e.inputType === 'insertFromPaste' ? text.replace(/\r/g, '').split('\n') : [text];
    const blocks = lines.map(line => makeBlock('sc-action', line));
    blocks.forEach(block => paper.append(block));
    placeCaret(blocks.at(-1), true);
    updateGlobalStats();
    queueSave();
    requestAnimationFrame(paginate);
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
      const movedBlocks = blocks.slice(firstOverflow);
      const activeBlock = currentBlock();
      const caretOffset = caretOffsetInBlock(activeBlock);
      movedBlocks.reverse().forEach(block => nextPaper.prepend(block));
      if (activeBlock && movedBlocks.includes(activeBlock)) restoreCaretInBlock(activeBlock, caretOffset);
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
    updateSceneStats();
    saveStatusEl.textContent = '// UNSAVED CHANGES'; statusDot.classList.add('saving');
  }
  function estimatedBlockLines(block) {
    if (!block.innerText.trim()) return 0;
    const style = window.getComputedStyle(block);
    const lineHeight = parseFloat(style.lineHeight);
    const margins = parseFloat(style.marginTop) + parseFloat(style.marginBottom);
    if (Number.isFinite(lineHeight) && lineHeight > 0) {
      return Math.max(1, Math.ceil((block.offsetHeight + margins) / lineHeight));
    }
    return Math.max(1, Math.ceil(block.innerText.trim().split(/\s+/).length / 12));
  }
  function screenplayScenes() {
    const blocks = [...pagesContainer.querySelectorAll('.editor-paper')].flatMap(paper => [...paper.children]);
    const scenes = [];
    let scene = null;
    blocks.forEach(block => {
      if (block.classList.contains('sc-slugline')) {
        if (scene?.blocks.length) scenes.push(scene);
        scene = { heading: block.innerText.trim() || 'UNTITLED SCENE', blocks: [] };
      }
      if (!scene) scene = { heading: 'OPENING', blocks: [] };
      scene.blocks.push(block);
    });
    if (scene?.blocks.some(block => block.innerText.trim())) scenes.push(scene);
    return scenes.map((item, index) => {
      const lines = item.blocks.reduce((total, block) => total + estimatedBlockLines(block), 0);
      return { ...item, index: index + 1, seconds: Math.max(15, Math.round((lines / 55) * 60 / 5) * 5) };
    });
  }
  function formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainder = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
  }
  function updateSceneStats() {
    const scenes = screenplayScenes();
    const totalSeconds = scenes.reduce((total, scene) => total + scene.seconds, 0);
    const activeBlock = currentBlock();
    const activeScene = scenes.find(scene => activeBlock && scene.blocks.includes(activeBlock));
    sceneCountEl.textContent = `SCENES: ${scenes.length}`;
    runtimeEstimateEl.textContent = `EST. RUN TIME: ${formatDuration(totalSeconds)}`;
    averageSceneEl.textContent = `AVG. SCENE: ${formatDuration(scenes.length ? Math.round(totalSeconds / scenes.length) : 0)}`;
    activeSceneTimeEl.textContent = activeScene ? `SCENE ${activeScene.index}: ~${formatDuration(activeScene.seconds)}` : 'SCENE: --:--';
    activeSceneTimeEl.parentElement.title = activeScene
      ? `${activeScene.heading} — estimated from formatted script length.`
      : 'Estimated from the formatted script length. One screenplay page is roughly one minute.';
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
