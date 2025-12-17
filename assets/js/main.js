(async function () {
  const data = await fetch('./assets/js/products.json', { cache: 'no-store' }).then(r => r.json());

  const filtersEl = document.getElementById('categoryFilters');
  const gridEl = document.getElementById('productGrid');

  const categories = ['全部'].concat(data.categories || []);
  let active = '全部';

  // Modal
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
    document.addEventListener('keydown',(e)=>{
      if(e.key==='Escape' && modalEl.classList.contains('is-open')) closeModal();
    });
  }

  const PRICE_LINE = '💬 價格與搭配請洽官方 LINE';
  const NOTE_LINE  = '📌 可依體質協助搭配建議';

  function safe(s){ return String(s ?? ''); }

  function renderDanshenScrollModal(product){
    const items = Array.isArray(product.series_items) ? product.series_items : [];
    return `
      <h2 id="modalTitle" style="margin:0 0 6px">${safe(product.name)}</h2>
      ${product.subtitle ? `<p style="margin:0 0 8px;color:#666">${safe(product.subtitle)}</p>` : ''}
      <p class="price-line">${PRICE_LINE}</p>
      <p class="price-line">${NOTE_LINE}</p>

      <div class="seriesScroll">
        ${items.map(it => `
          <section class="seriesItem">
            <img src="./assets/img/${safe(it.image)}" alt="${safe(it.name)}"
                 onerror="this.src='./assets/img/logo.png'">
            <div class="seriesItem__body">
              <h3 class="seriesItem__name">${safe(it.name)}</h3>
              <p class="seriesItem__desc">${safe(it.desc || '')}</p>

              ${Array.isArray(it.usage) && it.usage.length ? `
                <ul class="seriesItem__usage">
                  ${it.usage.map(u => `<li>${safe(u)}</li>`).join('')}
                </ul>
              ` : ''}
            </div>
          </section>
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
      ? `<ul style="margin:10px 0 0;padding-left:18px">
           ${arr.map(t=>`<li>${prefix}${safe(t)}</li>`).join('')}
         </ul>`
      : '';

    return `
      <h2 id="modalTitle" style="margin:0 0 6px">${title}</h2>
      ${subtitle ? `<p style="margin:0 0 12px;color:#666">${subtitle}</p>` : ''}
      <img src="${imgSrc}" alt="${title}"
           style="width:100%;border-radius:12px;max-height:340px;object-fit:cover"
           onerror="this.src='./assets/img/logo.png'">

      ${list(effects.slice(0, 8), '功效：')}
      ${list(usage.slice(0, 10), '用法：')}

      <p class="price-line">${PRICE_LINE}</p>
      <p class="price-line">${NOTE_LINE}</p>
    `;
  }

  function openProduct(product){
    if(!product) return;
    if(product.id === 'danshen-series'){
      openModal(renderDanshenScrollModal(product));
      return;
    }
    openModal(renderProductModal(product));
  }

  function makeChip(label) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'chip';
    btn.textContent = label;
    btn.setAttribute('aria-pressed', label === active ? 'true' : 'false');
    btn.addEventListener('click', () => {
      active = label;
      [...filtersEl.querySelectorAll('.chip')].forEach(c =>
        c.setAttribute('aria-pressed', c.textContent === active ? 'true' : 'false')
      );
      render();
    });
    return btn;
  }

  function card(product) {
    const wrapper = document.createElement('article');
    wrapper.className = 'card';
    wrapper.setAttribute('data-category', product.category);
    wrapper.tabIndex = 0;
    wrapper.setAttribute('role', 'button');

    const img = document.createElement('img');
    img.className = 'card__img';
    img.loading = 'lazy';
    img.src = './assets/img/' + safe(product.image || 'logo.png');
    img.alt = safe(product.name);
    img.onerror = () => { img.src = './assets/img/logo.png'; };

    const body = document.createElement('div');
    body.className = 'card__body';

    const title = document.createElement('h3');
    title.className = 'card__title';
    title.textContent = safe(product.name);

    const list = document.createElement('ul');
    list.className = 'list';

    (Array.isArray(product.effects) ? product.effects : []).slice(0, 2).forEach(t => {
      const li = document.createElement('li');
      li.textContent = safe(t);
      list.appendChild(li);
    });

    const priceBox = document.createElement('div');
    priceBox.className = 'priceBox';
    priceBox.innerHTML = `${PRICE_LINE}<br>${NOTE_LINE}`;

    body.append(title, list, priceBox);
    wrapper.append(img, body);

    wrapper.addEventListener('click', () => openProduct(product));
    wrapper.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
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
      gridEl.innerHTML = `
        <div class="notice">
          <div class="notice__title">找不到產品</div>
          <div class="notice__text">換個分類試試，或直接加入官方 LINE 讓我們幫你挑。</div>
        </div>
      `;
      return;
    }
    items.forEach(p => gridEl.appendChild(card(p)));
  }

  // filters
  if (filtersEl) categories.forEach(c => filtersEl.appendChild(makeChip(c)));
  render();
})();
