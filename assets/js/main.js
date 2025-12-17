(async function () {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const data = await fetch('./assets/js/products.json', { cache: 'no-store' }).then(r => r.json());

  const filtersEl = document.getElementById('categoryFilters');
  const gridEl = document.getElementById('productGrid');

  const categories = ['全部'].concat(data.categories || []);
  let active = '全部';

  // expose products for debugging
  window.__WUJI_PRODUCTS = data.products || [];

  function safe(text) {
    return (text || '').toString();
  }

  function makeChip(label) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'chip';
    btn.textContent = label;
    btn.setAttribute('aria-pressed', label === active ? 'true' : 'false');
    btn.addEventListener('click', () => {
      active = label;
      [...filtersEl.querySelectorAll('.chip')].forEach(c => c.setAttribute('aria-pressed', c.textContent === active ? 'true' : 'false'));
      render();
    });
    return btn;
  }

  // ------------------------------
  // Modal helpers (use #productModal)
  // ------------------------------
  const modalEl = document.getElementById('productModal');
  const modalContentEl = document.getElementById('modalContent');

  function openModal(html){
    if(!modalEl || !modalContentEl) return;
    modalContentEl.innerHTML = html;
    modalEl.classList.add('is-open');
    modalEl.setAttribute('aria-hidden','false');
    document.body.style.overflow='hidden';
  }
  function closeModal(){
    if(!modalEl) return;
    modalEl.classList.remove('is-open');
    modalEl.setAttribute('aria-hidden','true');
    document.body.style.overflow='';
    if(modalContentEl) modalContentEl.innerHTML='';
  }

  if(modalEl){
    modalEl.addEventListener('click',(e)=>{
      const t=e.target;
      if(t && t.getAttribute && t.getAttribute('data-close')==='true') closeModal();
    });
    document.addEventListener('keydown',(e)=>{ if(e.key==='Escape' && modalEl.classList.contains('is-open')) closeModal(); });
  }

  function priceLines(){
    return `
      <p class="price-line">💬 價格與搭配請洽官方 LINE</p>
      <p class="price-line">📌 可依體質協助搭配建議</p>
    `;
  }

  function renderDanshenSeriesModal(){
    const items = [
      { name:'武大漢丹參茶', image:'./assets/img/LINE_NOTE_251216_19.jpg', desc:'調整體質・增強體力' },
      { name:'台灣丹參纖體茶', image:'./assets/img/LINE_NOTE_251216_20.jpg', desc:'代謝調整・體態管理' },
      { name:'台灣丹參舒活茶', image:'./assets/img/LINE_NOTE_251216_21.jpg', desc:'日常調養・精神舒暢' },
    ];
    return `
      <h2 id="modalTitle" style="margin:0 0 6px">台灣丹蔘茶包系列</h2>
      <p style="margin:0 0 10px;color:#666">點進來一次看三款。</p>
      <div class="danshenGrid">
        ${items.map(it=>`
          <div class="danshenCard">
            <img src="${it.image}" alt="${it.name}">
            <div class="body">
              <p class="name">${it.name}</p>
              <p class="desc">${it.desc}</p>
              ${priceLines()}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  function renderProductModal(product){
    const title = safe(product.name);
    const subtitle = safe(product.subtitle || '');
    const imgFile = safe(product.image || 'logo.png');
    const imgSrc = './assets/img/' + imgFile;

    const effects = Array.isArray(product.effects) ? product.effects : [];
    const usage = Array.isArray(product.usage) ? product.usage : [];

    const list = (arr, prefix) => arr.length
      ? `<ul style="margin:10px 0 0;padding-left:18px">${arr.map(t=>`<li>${prefix}${safe(t)}</li>`).join('')}</ul>`
      : '';

    return `
      <h2 id="modalTitle" style="margin:0 0 6px">${title}</h2>
      ${subtitle ? `<p style="margin:0 0 12px;color:#666">${subtitle}</p>` : ''}
      <img src="${imgSrc}" alt="${title}" style="width:100%;border-radius:12px;max-height:340px;object-fit:cover" onerror="this.src='./assets/img/logo.png'">
      ${list(effects.slice(0,6), '功效：')}
      ${list(usage.slice(0,8), '用法：')}
      ${priceLines()}
    `;
  }

  function openProduct(product){
    if(!product) return;
    if(product.id === 'danshen-series'){
      openModal(renderDanshenSeriesModal());
      return;
    }
    openModal(renderProductModal(product));
  }

  function card(product) {
    const wrapper = document.createElement('article');
    wrapper.className = 'card';
    wrapper.setAttribute('data-category', product.category);
    wrapper.tabIndex = 0;
    wrapper.setAttribute('role','button');
    wrapper.setAttribute('aria-label', `${safe(product.name)} 詳細內容`);

    const img = document.createElement('img');
    img.className = 'card__img';
    img.loading = 'lazy';
    img.src = './assets/img/' + safe(product.image || 'logo.png');
    img.alt = product.name;
    img.onerror = () => { img.src = './assets/img/logo.png'; };

    const body = document.createElement('div');
    body.className = 'card__body';

    const title = document.createElement('h3');
    title.className = 'card__title';
    title.textContent = safe(product.name);

    const subtitle = document.createElement('p');
    subtitle.className = 'card__subtitle';
    subtitle.textContent = safe(product.subtitle || product.category);

    const badges = document.createElement('div');
    badges.className = 'badges';
    const b1 = document.createElement('span');
    b1.className = 'badge';
    b1.textContent = safe(product.category);
    badges.appendChild(b1);

    const list = document.createElement('ul');
    list.className = 'list';

    const effects = (product.effects || []).slice(0, 3);
    const usage = (product.usage || []).slice(0, 3);

    if (effects.length) {
      effects.forEach(t => {
        const li = document.createElement('li');
        li.textContent = '功效：' + safe(t);
        list.appendChild(li);
      });
    }
    if (usage.length) {
      usage.forEach(t => {
        const li = document.createElement('li');
        li.textContent = '用法：' + safe(t);
        list.appendChild(li);
      });
    }

    const priceBox = document.createElement('div');
    priceBox.className = 'priceBox';
    const price = document.createElement('div');
    price.className = 'price';
    price.textContent = '💬 價格與搭配請洽官方 LINE';
    const note = document.createElement('div');
    note.className = 'note';
    note.textContent = '📌 可依體質協助搭配建議';
    priceBox.append(price, note);

    body.append(title, subtitle, badges, list, priceBox);
    wrapper.append(img, body);

    wrapper.addEventListener('click', ()=> openProduct(product));
    wrapper.addEventListener('keydown', (e)=>{
      if(e.key === 'Enter' || e.key === ' '){
        e.preventDefault();
        openProduct(product);
      }
    });

    return wrapper;
  }

  function render() {
    gridEl.innerHTML = '';
    const items = (data.products || []).filter(p => active === '全部' ? true : p.category === active);
    if (!items.length) {
      const empty = document.createElement('div');
      empty.className = 'notice';
      empty.innerHTML = '<div class="notice__title">找不到產品</div><div class="notice__text">換個分類試試，或直接加入官方 LINE 讓我們幫你挑。</div>';
      gridEl.appendChild(empty);
      return;
    }
    items.forEach(p => gridEl.appendChild(card(p)));
  }

  if (filtersEl) {
    categories.forEach(c => filtersEl.appendChild(makeChip(c)));
  }
  render();
})();
