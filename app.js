const animals = [
  { id: 'RAM-1001', breed: 'Sardi', age: 'Sennane', weight: 71, price: 4900, onssa: true },
  { id: 'RAM-1002', breed: 'Barki', age: 'Jad3', weight: 58, price: 3600, onssa: true },
  { id: 'RAM-1003', breed: 'Timahdite', age: 'Sennane', weight: 63, price: 4100, onssa: true },
  { id: 'RAM-1004', breed: 'Sardi', age: 'Jad3', weight: 76, price: 5300, onssa: true },
];

const i18n = {
  fr: {
    title: 'Sawk Online Eid al-Adha',
    subtitle: 'Choisissez votre mouton avec transparence: poids, âge, santé ONSSA, livraison.',
    filters: 'Filtres',
    catalog: 'Catalogue',
    journey: 'Parcours Client',
  },
  darija: {
    title: 'سوق العيد أونلاين',
    subtitle: 'ختار الحولي ديالك بوضوح: الوزن، العمر، شهادة ONSSA، والتوصيل.',
    filters: 'الفيلترات',
    catalog: 'الكتالوك',
    journey: 'رحلة الزبون',
  }
};

function renderCatalog(items) {
  const el = document.getElementById('catalog');
  el.innerHTML = items.map(a => {
    const madKg = (a.price / a.weight).toFixed(2);
    return `<article class="ram">
      <h3>${a.id}</h3>
      <p>${a.breed} · ${a.age}</p>
      <p><strong>${a.weight} kg</strong> — ${a.price} MAD</p>
      <p>${madKg} MAD/kg</p>
      <div class="badges">
        <span class="badge">ONSSA</span>
        <span class="badge">Disponible</span>
      </div>
    </article>`;
  }).join('');
}

function applyFilters() {
  const breed = document.getElementById('breedFilter').value;
  const age = document.getElementById('ageFilter').value;
  const min = Number(document.getElementById('minWeight').value || 0);
  const max = Number(document.getElementById('maxWeight').value || 999);

  const filtered = animals.filter(a =>
    (breed === 'all' || a.breed === breed) &&
    (age === 'all' || a.age === age) &&
    a.weight >= min && a.weight <= max
  );

  renderCatalog(filtered);
}

function setLang(lang) {
  document.querySelectorAll('[data-i18n]').forEach(node => {
    const key = node.getAttribute('data-i18n');
    node.textContent = i18n[lang][key];
  });
}

['breedFilter', 'ageFilter', 'minWeight', 'maxWeight'].forEach(id => {
  document.getElementById(id).addEventListener('input', applyFilters);
});

document.getElementById('langSelect').addEventListener('change', (e) => setLang(e.target.value));
document.getElementById('whatsappBtn').addEventListener('click', () => {
  window.open('https://wa.me/212600000000?text=Salam%20bghit%20live%20video%20inspection', '_blank');
});

setLang('fr');
renderCatalog(animals);
