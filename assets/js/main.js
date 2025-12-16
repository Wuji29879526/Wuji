
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
