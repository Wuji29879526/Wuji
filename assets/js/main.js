
(async function () {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const data = await fetch('./assets/js/products.json', { cache: 'no-store' }).then(r => r.json());

  const filtersEl = document.getElementById('categoryFilters');
  const gridEl = document.getElementById('productGrid');

  const categories = ['全部'].concat(data.categories || []);
  let active = '全部';

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

  function safe(text) {
    return (text || '').toString();
  }

  function card(product) {
    const wrapper = document.createElement('article');
    wrapper.className = 'card';
    wrapper.setAttribute('data-category', product.category);

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

    const mini = document.createElement('div');
    mini.className = 'mini';
    mini.textContent = safe(product.note || '');

    const priceBox = document.createElement('div');
    priceBox.className = 'priceBox';
    const price = document.createElement('div');
    price.className = 'price';
    price.textContent = safe(product.price || '💬 價格與搭配請洽官方 LINE');
    const note = document.createElement('div');
    note.className = 'note';
    note.textContent = safe(product.price_note || '📌 可依體質協助搭配建議');
    priceBox.append(price, note);

    body.append(title, subtitle, badges, list);
    if (product.note) body.append(mini);
    body.append(priceBox);

    wrapper.append(img, body);

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

  // build filters
  if (filtersEl) {
    categories.forEach(c => filtersEl.appendChild(makeChip(c)));
  }
  render();
})();


// ------------------------------
// Modal helpers
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

function renderDefaultProductModal(product){
  const safe = (s)=> String(s||'');
  const priceLine = '💬 價格與搭配請洽官方 LINE';
  const noteLine  = '📌 可依體質協助搭配建議';
  const img = product.image ? `<img src="${safe(product.image)}" alt="${safe(product.name)}" style="width:100%;border-radius:12px;max-height:320px;object-fit:cover"/>` : '';
  const tags = Array.isArray(product.tags) ? product.tags.map(t=>`<span class="tag">${safe(t)}</span>`).join('') : '';
  const benefits = Array.isArray(product.benefits) ? `<ul>${product.benefits.map(b=>`<li>${safe(b)}</li>`).join('')}</ul>` : '';
  const ingredients = Array.isArray(product.ingredients) ? `<p><strong>成分：</strong>${product.ingredients.map(safe).join('、')}</p>` : '';
  const usage = product.usage ? `<p><strong>使用方式：</strong>${safe(product.usage)}</p>` : '';

  return `
    <h2 id="modalTitle" style="margin:0 0 6px">${safe(product.name)}</h2>
    ${product.subtitle ? `<p style="margin:0 0 12px;color:#666">${safe(product.subtitle)}</p>` : ''}
    ${img}
    <div style="margin-top:12px">${tags}</div>
    ${benefits}
    ${ingredients}
    ${usage}
    <p class="price-line">${priceLine}</p>
    <p class="price-line">${noteLine}</p>
  `;
}

function renderDanshenModal(){
  const priceLine = '💬 價格與搭配請洽官方 LINE';
  const noteLine  = '📌 可依體質協助搭配建議';
  const teas = [
    {
      name:'武大漢丹參茶',
      img:'assets/img/products/danshen_wudahan.jpg',
      desc:'日常調養｜增強體力｜回甘順口（10包入／3公克）'
    },
    {
      name:'臺灣丹參纖體茶',
      img:'assets/img/products/danshen_slim.jpg',
      desc:'調整體質｜青春美麗｜清爽回甘（10包入／3公克）'
    },
    {
      name:'臺灣丹參舒活茶',
      img:'assets/img/products/danshen_shuhuo.jpg',
      desc:'舒活順暢｜調整體質｜日常保養（10包入／3公克）'
    }
  ];

  return `
    <h2 id="modalTitle" style="margin:0 0 6px">台灣丹蔘茶包系列</h2>
    <p style="margin:0 0 10px;color:#666">同系列三款，一次看懂差異（點圖也能放大看包裝）。</p>
    <div class="danshenGrid">
      ${teas.map(t=>`
        <div class="danshenCard">
          <img src="${t.img}" alt="${t.name}"/>
          <div class="body">
            <p class="name">${t.name}</p>
            <p class="desc">${t.desc}</p>
            <p class="price-line">${priceLine}</p>
            <p class="price-line">${noteLine}</p>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function escapeHtml(str){
  return String(str ?? '').replace(/[&<>"]/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[s]));
}

function renderProductModal(product){
  const title = escapeHtml(product.name);
  const subtitle = escapeHtml(product.subtitle || '');
  const img = escapeHtml(product.image || '');
  const badges = (product.badges || []).map(b=>`<span class="badge">${escapeHtml(b)}</span>`).join('');
  const points = (product.points || []).map(p=>`<li>${escapeHtml(p)}</li>`).join('');
  const note = product.note ? `<div class="miniNote">${escapeHtml(product.note)}</div>` : '';
  const price = escapeHtml(product.price || '💬 價格與搭配請洽官方 LINE');
  const priceNote = escapeHtml(product.price_note || '📌 可依體質協助搭配建議');

  return `
    <div class="modal__header">
      <div>
        <div class="modal__title">${title}</div>
        ${subtitle ? `<div class="modal__subtitle">${subtitle}</div>` : ''}
      </div>
      <button class="modal__close" data-close="true" aria-label="Close">✕</button>
    </div>
    <div class="modal__body">
      <div class="modal__media">
        <img src="${img}" alt="${title}">
      </div>
      <div class="modal__info">
        ${badges ? `<div class="badgeRow">${badges}</div>` : ''}
        ${points ? `<ul class="points">${points}</ul>` : ''}
        ${note}
        <div class="priceBlock">
          <div class="priceLine">${price}</div>
          <div class="priceLine">${priceNote}</div>
        </div>
      </div>
    </div>
  `;
}

function renderDanshenSeriesModal(){
  const items = [
    {
      name: '武大漢丹參茶',
      subtitle: '調整體質・增強體力',
      image: 'assets/img/products/danshen-wudahan.jpg',
      points: ['每盒 10 包入｜每包 3 公克', '沖泡 500cc 冷／溫開水 3–5 分鐘', '可依個人喜好回沖 2–3 次（約 300cc）'],
    },
    {
      name: '臺灣丹參纖體茶',
      subtitle: '調整體質・青春美麗',
      image: 'assets/img/products/danshen-xianticha.jpg',
      points: ['每盒 10 包入｜每包 3 公克', '沖泡 500cc 冷／溫開水 3–5 分鐘', '可依個人喜好回沖 2–3 次（約 300cc）'],
    },
    {
      name: '臺灣丹參舒活茶',
      subtitle: '調整體質・青春美麗',
      image: 'assets/img/products/danshen-shuhuotea.jpg',
      points: ['每盒 10 包入｜每包 3 公克', '沖泡 500cc 冷／溫開水 3–5 分鐘', '可依個人喜好回沖 2–3 次（約 300cc）'],
    },
  ];
  const price = '💬 價格與搭配請洽官方 LINE';
  const priceNote = '📌 可依體質協助搭配建議';

  const cards = items.map(it => `
    <div class="seriesCard">
      <img src="${escapeHtml(it.image)}" alt="${escapeHtml(it.name)}">
      <div class="seriesCard__body">
        <div class="seriesCard__name">${escapeHtml(it.name)}</div>
        <div class="seriesCard__sub">${escapeHtml(it.subtitle)}</div>
        <ul class="points">${(it.points||[]).map(p=>`<li>${escapeHtml(p)}</li>`).join('')}</ul>
      </div>
    </div>
  `).join('');

  return `
    <div class="modal__header">
      <div>
        <div class="modal__title">台灣丹蔘茶包系列</div>
        <div class="modal__subtitle">點進來一次看三款（同頁彈窗）</div>
      </div>
      <button class="modal__close" data-close="true" aria-label="Close">✕</button>
    </div>
    <div class="modal__body">
      <div class="seriesGrid">${cards}</div>
      <div class="priceBlock" style="margin-top:14px;">
        <div class="priceLine">${price}</div>
        <div class="priceLine">${priceNote}</div>
      </div>
    </div>
  `;
}

function openProductById(id){
  if(id === 'danshen-series'){
    openModal(renderDanshenSeriesModal());
    return;
  }
  const list = window.__WUJI_PRODUCTS || [];
  const product = list.find(p=>p.id===id);
  if(!product) return;
  openModal(renderProductModal(product));
}

// Event delegation for product cards
document.addEventListener('click', (e)=>{
  const card = e.target && e.target.closest ? e.target.closest('.productCard') : null;
  if(!card) return;
  const id = card.dataset.productId;
  if(id) openProductById(id);
});

document.addEventListener('keydown', (e)=>{
  if(e.key==='Escape') closeModal();
  if(e.key==='Enter' || e.key===' ') {
    const active = document.activeElement;
    if(active && active.classList && active.classList.contains('productCard')){
      e.preventDefault();
      const id = active.dataset.productId;
      if(id) openProductById(id);
    }
  }
});

