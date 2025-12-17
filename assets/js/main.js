(async function(){
  const data = await fetch('./assets/js/products.json').then(r=>r.json());
  const grid = document.getElementById('productGrid');
  const filters = document.getElementById('categoryFilters');

  let active = '全部';
  const cats = ['全部', ...(data.categories||[])];

  cats.forEach(c=>{
    const b=document.createElement('button');
    b.className='chip';
    b.textContent=c;
    b.onclick=()=>{active=c;render()};
    filters.appendChild(b);
  });

  function render(){
    grid.innerHTML='';
    data.products
      .filter(p=>active==='全部'||p.category===active)
      .forEach(p=>{
        const el=document.createElement('div');
        el.className='card';
        el.innerHTML=`
          <img class="card__img" src="./assets/img/${p.image}" onerror="this.src='./assets/img/logo.png'">
          <div class="card__body">
            <div class="card__title">${p.name}</div>
            <ul class="list">
              ${(p.effects||[]).slice(0,2).map(e=>`<li>${e}</li>`).join('')}
            </ul>
            <div class="priceBox">
              💬 價格與搭配請洽官方 LINE<br>
              📌 可依體質協助搭配建議
            </div>
          </div>
        `;
        grid.appendChild(el);
      });
  }

  render();
})();
