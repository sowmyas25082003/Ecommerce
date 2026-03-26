// ========== PRODUCT DATA ==========
const productsData = [
  { id: 1, title: "Premium Wireless Headphones", price: 199.99, rating: 4.7, category: "Electronics", stock: 15, images: ["https://picsum.photos/id/1/400/300"], createdAt: "2024-01-15" },
  { id: 2, title: "Organic Cotton T-Shirt", price: 29.99, rating: 4.2, category: "Clothing", stock: 42, images: ["https://picsum.photos/id/2/400/300"], createdAt: "2024-02-10" },
  { id: 3, title: "Smart Watch Pro", price: 299.99, rating: 4.8, category: "Electronics", stock: 8, images: ["https://picsum.photos/id/3/400/300"], createdAt: "2024-01-20" },
  { id: 4, title: "Leather Backpack", price: 89.99, rating: 4.5, category: "Accessories", stock: 23, images: ["https://picsum.photos/id/4/400/300"], createdAt: "2024-02-05" },
  { id: 5, title: "Ceramic Coffee Mug", price: 14.99, rating: 4.3, category: "Home", stock: 56, images: ["https://picsum.photos/id/5/400/300"], createdAt: "2024-01-28" },
  { id: 6, title: "Noise Cancelling Earbuds", price: 159.99, rating: 4.6, category: "Electronics", stock: 12, images: ["https://picsum.photos/id/6/400/300"], createdAt: "2024-02-18" },
  { id: 7, title: "Yoga Mat Non-Slip", price: 39.99, rating: 4.4, category: "Sports", stock: 34, images: ["https://picsum.photos/id/7/400/300"], createdAt: "2024-01-12" },
  { id: 8, title: "Desk Lamp LED", price: 49.99, rating: 4.1, category: "Home", stock: 19, images: ["https://picsum.photos/id/8/400/300"], createdAt: "2024-02-22" },
  { id: 9, title: "Running Shoes", price: 79.99, rating: 4.5, category: "Sports", stock: 27, images: ["https://picsum.photos/id/9/400/300"], createdAt: "2024-01-30" },
  { id: 10, title: "Smartphone Stand", price: 19.99, rating: 4.0, category: "Accessories", stock: 88, images: ["https://picsum.photos/id/10/400/300"], createdAt: "2024-02-14" },
  { id: 11, title: "Bluetooth Speaker", price: 69.99, rating: 4.6, category: "Electronics", stock: 21, images: ["https://picsum.photos/id/11/400/300"], createdAt: "2024-01-25" },
  { id: 12, title: "Winter Scarf", price: 24.99, rating: 4.2, category: "Clothing", stock: 45, images: ["https://picsum.photos/id/12/400/300"], createdAt: "2024-02-01" }
];

// ========== GLOBAL STATE ==========
let cart = [];
let currentView = 'grid';
let currentSort = 'default';
let currentPage = 1;
const ITEMS_PER_PAGE = 8;

// Filter State
let filters = {
  categories: [],
  minPrice: 0,
  maxPrice: 500,
  minRating: 0,
  inStockOnly: false
};

// ========== DOM Elements ==========
const productsContainer = document.getElementById('productsContainer');
const cartOverlay = document.getElementById('cartOverlay');
const cartItemsList = document.getElementById('cartItemsList');
const cartTotalSpan = document.getElementById('cartTotal');
const cartCountBadge = document.getElementById('cartCountBadge');
const categoryFilterDiv = document.getElementById('categoryFilter');
const minPriceInput = document.getElementById('minPrice');
const maxPriceInput = document.getElementById('maxPrice');
const priceSliderMin = document.getElementById('priceSliderMin');
const priceSliderMax = document.getElementById('priceSliderMax');
const inStockCheckbox = document.getElementById('inStockOnly');
const sortSelect = document.getElementById('sortBy');
const gridViewBtn = document.getElementById('gridViewBtn');
const listViewBtn = document.getElementById('listViewBtn');
const loadingSkeleton = document.getElementById('loadingSkeleton');
const emptyState = document.getElementById('emptyState');
const paginationDiv = document.getElementById('pagination');
const productModal = document.getElementById('productModal');
const modalBody = document.getElementById('modalBody');

// ========== Helper Functions ==========
function saveCartToLocalStorage() {
  localStorage.setItem('ecommerce_cart', JSON.stringify(cart));
}

function loadCartFromLocalStorage() {
  const saved = localStorage.getItem('ecommerce_cart');
  if (saved) {
    cart = JSON.parse(saved);
    updateCartUI();
  }
}

function updateCartUI() {
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCountBadge.textContent = itemCount;
  
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  cartTotalSpan.textContent = `$${total.toFixed(2)}`;
  
  renderCartItems();
  saveCartToLocalStorage();
}

function renderCartItems() {
  if (cart.length === 0) {
    cartItemsList.innerHTML = '<div class="empty-state" style="padding:2rem;text-align:center">Your cart is empty</div>';
    return;
  }
  
  cartItemsList.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.title}" class="cart-item-image">
      <div class="cart-item-details">
        <div class="cart-item-title">${item.title}</div>
        <div class="cart-item-price">$${item.price}</div>
        <div class="cart-item-actions">
          <button class="qty-btn" data-id="${item.id}" data-delta="-1">-</button>
          <span>${item.quantity}</span>
          <button class="qty-btn" data-id="${item.id}" data-delta="1">+</button>
          <button class="remove-item" data-id="${item.id}">Remove</button>
        </div>
      </div>
    </div>
  `).join('');
  
  document.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(btn.dataset.id);
      const delta = parseInt(btn.dataset.delta);
      updateCartQuantity(id, delta);
    });
  });
  
  document.querySelectorAll('.remove-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(btn.dataset.id);
      removeFromCart(id);
    });
  });
}

function addToCart(product) {
  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  updateCartUI();
  showNotification('Added to cart!');
}

function updateCartQuantity(id, delta) {
  const item = cart.find(i => i.id === id);
  if (item) {
    item.quantity += delta;
    if (item.quantity <= 0) {
      cart = cart.filter(i => i.id !== id);
    }
    updateCartUI();
  }
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  updateCartUI();
}

function showNotification(msg) {
  const notif = document.createElement('div');
  notif.textContent = msg;
  notif.style.position = 'fixed';
  notif.style.bottom = '20px';
  notif.style.right = '20px';
  notif.style.background = '#1e3c72';
  notif.style.color = 'white';
  notif.style.padding = '0.75rem 1.5rem';
  notif.style.borderRadius = '2rem';
  notif.style.zIndex = '2000';
  document.body.appendChild(notif);
  setTimeout(() => notif.remove(), 2000);
}

// ========== Filtering & Sorting Logic ==========
function getUniqueCategories() {
  return [...new Set(productsData.map(p => p.category))];
}

function renderCategoryFilters() {
  const categories = getUniqueCategories();
  categoryFilterDiv.innerHTML = categories.map(cat => `
    <label>
      <input type="checkbox" value="${cat}" class="category-checkbox">
      ${cat}
    </label>
  `).join('');
  
  document.querySelectorAll('.category-checkbox').forEach(cb => {
    cb.addEventListener('change', () => {
      filters.categories = Array.from(document.querySelectorAll('.category-checkbox:checked'))
        .map(c => c.value);
      currentPage = 1;
      applyFiltersAndRender();
    });
  });
}

function applyFiltersAndRender() {
  let filtered = [...productsData];
  
  // Category filter
  if (filters.categories.length > 0) {
    filtered = filtered.filter(p => filters.categories.includes(p.category));
  }
  
  // Price filter
  filtered = filtered.filter(p => p.price >= filters.minPrice && p.price <= filters.maxPrice);
  
  // Rating filter
  filtered = filtered.filter(p => p.rating >= filters.minRating);
  
  // Stock filter
  if (filters.inStockOnly) {
    filtered = filtered.filter(p => p.stock > 0);
  }
  
  // Sorting
  switch(currentSort) {
    case 'price_asc': filtered.sort((a,b) => a.price - b.price); break;
    case 'price_desc': filtered.sort((a,b) => b.price - a.price); break;
    case 'rating_desc': filtered.sort((a,b) => b.rating - a.rating); break;
    case 'newest': filtered.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)); break;
    default: break;
  }
  
  renderPaginatedProducts(filtered);
}

function renderPaginatedProducts(products) {
  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = products.slice(start, start + ITEMS_PER_PAGE);
  
  if (products.length === 0) {
    productsContainer.classList.add('hidden');
    emptyState.classList.remove('hidden');
    paginationDiv.innerHTML = '';
  } else {
    productsContainer.classList.remove('hidden');
    emptyState.classList.add('hidden');
    renderProducts(paginatedProducts);
    renderPagination(totalPages);
  }
}

function renderProducts(products) {
  productsContainer.className = currentView === 'grid' ? 'products-grid' : 'products-grid list-view';
  
  productsContainer.innerHTML = products.map(product => `
    <div class="product-card" data-id="${product.id}">
      <img src="${product.images[0]}" alt="${product.title}" class="product-image">
      <div class="product-info">
        <div class="product-title">${product.title}</div>
        <div class="product-rating">★ ${product.rating} / 5</div>
        <div class="product-price">$${product.price.toFixed(2)}</div>
        <div class="product-stock ${product.stock === 0 ? 'out-of-stock' : ''}">
          ${product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
        </div>
        <button class="add-to-cart-btn" data-id="${product.id}" ${product.stock === 0 ? 'disabled' : ''}>
          ${product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </div>
  `).join('');
  
  document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (!e.target.classList.contains('add-to-cart-btn')) {
        const id = parseInt(card.dataset.id);
        openProductModal(id);
      }
    });
  });
  
  document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.id);
      const product = productsData.find(p => p.id === id);
      if (product && product.stock > 0) addToCart(product);
    });
  });
}

function renderPagination(totalPages) {
  if (totalPages <= 1) {
    paginationDiv.innerHTML = '';
    return;
  }
  
  let pagesHtml = '';
  for (let i = 1; i <= totalPages; i++) {
    pagesHtml += `<button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
  }
  paginationDiv.innerHTML = pagesHtml;
  
  document.querySelectorAll('.page-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentPage = parseInt(btn.dataset.page);
      applyFiltersAndRender();
    });
  });
}

// ========== Product Modal ==========
function openProductModal(id) {
  const product = productsData.find(p => p.id === id);
  if (!product) return;
  
  modalBody.innerHTML = `
    <img src="${product.images[0]}" alt="${product.title}" class="modal-product-image">
    <h2>${product.title}</h2>
    <div class="product-rating">★ ${product.rating} / 5</div>
    <p class="product-price">$${product.price.toFixed(2)}</p>
    <p><strong>Category:</strong> ${product.category}</p>
    <p><strong>Availability:</strong> ${product.stock > 0 ? `In Stock (${product.stock} units)` : 'Out of Stock'}</p>
    <button class="add-to-cart-btn" data-id="${product.id}" ${product.stock === 0 ? 'disabled' : ''} style="margin-top:1rem">
      ${product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
    </button>
  `;
  
  const modalAddBtn = modalBody.querySelector('.add-to-cart-btn');
  if (modalAddBtn) {
    modalAddBtn.addEventListener('click', () => {
      addToCart(product);
      productModal.classList.add('hidden');
    });
  }
  
  productModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  
  // Trap focus in modal
  const focusableElements = modalBody.querySelectorAll('button, [href], input');
  if (focusableElements.length) focusableElements[0].focus();
}

// ========== Event Listeners ==========
function initEventListeners() {
  document.getElementById('cartIconBtn').addEventListener('click', () => {
    cartOverlay.classList.remove('hidden');
  });
  
  document.getElementById('closeCartBtn').addEventListener('click', () => {
    cartOverlay.classList.add('hidden');
  });
  
  cartOverlay.addEventListener('click', (e) => {
    if (e.target === cartOverlay) cartOverlay.classList.add('hidden');
  });
  
  document.getElementById('closeModalBtn').addEventListener('click', () => {
    productModal.classList.add('hidden');
    document.body.style.overflow = '';
  });
  
  productModal.addEventListener('click', (e) => {
    if (e.target === productModal) {
      productModal.classList.add('hidden');
      document.body.style.overflow = '';
    }
  });
  
  document.getElementById('clearFiltersBtn').addEventListener('click', () => {
    filters = { categories: [], minPrice: 0, maxPrice: 500, minRating: 0, inStockOnly: false };
    document.querySelectorAll('.category-checkbox').forEach(cb => cb.checked = false);
    minPriceInput.value = 0;
    maxPriceInput.value = 500;
    priceSliderMin.value = 0;
    priceSliderMax.value = 500;
    inStockCheckbox.checked = false;
    document.querySelectorAll('.rating-btn').forEach(btn => btn.classList.remove('active'));
    currentPage = 1;
    applyFiltersAndRender();
  });
  
  document.getElementById('resetFiltersEmptyBtn')?.addEventListener('click', () => {
    document.getElementById('clearFiltersBtn').click();
  });
  
  document.getElementById('checkoutBtn').addEventListener('click', () => {
    alert('Checkout functionality would process your order!');
  });
  
  // Price filters
  const updatePriceFilters = () => {
    filters.minPrice = parseFloat(minPriceInput.value) || 0;
    filters.maxPrice = parseFloat(maxPriceInput.value) || 500;
    if (filters.minPrice > filters.maxPrice) filters.maxPrice = filters.minPrice;
    currentPage = 1;
    applyFiltersAndRender();
  };
  
  minPriceInput.addEventListener('change', updatePriceFilters);
  maxPriceInput.addEventListener('change', updatePriceFilters);
  priceSliderMin.addEventListener('input', (e) => { minPriceInput.value = e.target.value; updatePriceFilters(); });
  priceSliderMax.addEventListener('input', (e) => { maxPriceInput.value = e.target.value; updatePriceFilters(); });
  
  // Rating filter
  document.querySelectorAll('.rating-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.rating-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filters.minRating = parseInt(btn.dataset.rating);
      currentPage = 1;
      applyFiltersAndRender();
    });
  });
  
  inStockCheckbox.addEventListener('change', (e) => {
    filters.inStockOnly = e.target.checked;
    currentPage = 1;
    applyFiltersAndRender();
  });
  
  sortSelect.addEventListener('change', (e) => {
    currentSort = e.target.value;
    currentPage = 1;
    applyFiltersAndRender();
  });
  
  gridViewBtn.addEventListener('click', () => {
    currentView = 'grid';
    gridViewBtn.classList.add('active');
    listViewBtn.classList.remove('active');
    applyFiltersAndRender();
  });
  
  listViewBtn.addEventListener('click', () => {
    currentView = 'list';
    listViewBtn.classList.add('active');
    gridViewBtn.classList.remove('active');
    applyFiltersAndRender();
  });
  
  // Keyboard accessibility: close modal on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!productModal.classList.contains('hidden')) {
        productModal.classList.add('hidden');
        document.body.style.overflow = '';
      }
      if (!cartOverlay.classList.contains('hidden')) {
        cartOverlay.classList.add('hidden');
      }
    }
  });
}

// ========== Initialize ==========
function init() {
  loadCartFromLocalStorage();
  renderCategoryFilters();
  initEventListeners();
  applyFiltersAndRender();
}

init();