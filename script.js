'use strict';

const productData = [
  { id: 'bread', name: 'Handmade Breads', description: 'Fresh loaves for breakfast, sandwiches, dinners, and shared tables.' },
  { id: 'pastries', name: 'Pastries', description: 'Sweet and flaky choices for morning breaks, coffee, and small gatherings.' },
  { id: 'cakes', name: 'Celebration Cakes', description: 'Made for birthdays, community events, and other special occasions.' }
];

const storageKeys = {
  favorites: 'northStarFavorites',
  contact: 'northStarContact'
};

const validationRules = [
  { field: 'name', message: 'Please enter at least 2 characters for your name.' },
  { field: 'email', message: 'Please enter a valid email address.' },
  { field: 'details', message: 'Please enter at least 10 characters about your request.' }
];

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    return fallback;
  }
}

function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getFavorites() {
  return readJSON(storageKeys.favorites, []);
}

function saveFavorites(favorites) {
  writeJSON(storageKeys.favorites, favorites);
}

function toggleFavorite(productId) {
  const favorites = getFavorites();
  const nextFavorites = favorites.includes(productId)
    ? favorites.filter(id => id !== productId)
    : [...favorites, productId];
  saveFavorites(nextFavorites);
  renderFavorites();
}

function renderFavorites() {
  const favorites = getFavorites();
  document.querySelectorAll('[data-favorite-id]').forEach(button => {
    const id = button.dataset.favoriteId;
    const active = favorites.includes(id);
    button.classList.toggle('is-favorite', active);
    button.setAttribute('aria-pressed', String(active));
    button.textContent = active ? '★ Saved Favorite' : '☆ Save Favorite';
  });

  const summary = document.getElementById('favorites-summary');
  if (!summary) return;

  const names = productData
    .filter(product => favorites.includes(product.id))
    .map(product => product.name);

  summary.textContent = names.length
    ? `Saved favorites: ${names.join(', ')}. Your choices will still be here after you refresh or return.`
    : 'You have no saved favorites yet. Choose a product to remember it for later.';
}

function initFavorites() {
  const buttons = document.querySelectorAll('[data-favorite-id]');
  if (!buttons.length) return;
  buttons.forEach(button => {
    button.addEventListener('click', () => toggleFavorite(button.dataset.favoriteId));
  });
  renderFavorites();
}

function showError(fieldId, message) {
  const field = document.getElementById(fieldId);
  const error = document.getElementById(`${fieldId}-error`);
  if (!field || !error) return;
  error.textContent = message;
  field.setAttribute('aria-invalid', 'true');
  error.hidden = false;
}

function clearError(fieldId) {
  const field = document.getElementById(fieldId);
  const error = document.getElementById(`${fieldId}-error`);
  if (!field || !error) return;
  error.textContent = '';
  error.hidden = true;
  field.removeAttribute('aria-invalid');
}

function validateContactForm() {
  const name = document.getElementById('name');
  const email = document.getElementById('email');
  const details = document.getElementById('details');
  let valid = true;

  validationRules.forEach(rule => clearError(rule.field));

  if (!name.value.trim() || name.value.trim().length < 2) {
    showError('name', validationRules[0].message);
    valid = false;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email.value.trim())) {
    showError('email', validationRules[1].message);
    valid = false;
  }

  if (details.value.trim().length < 10) {
    showError('details', validationRules[2].message);
    valid = false;
  }

  return valid;
}

function saveContactPreferences() {
  const name = document.getElementById('name');
  const email = document.getElementById('email');
  if (!name || !email) return;
  writeJSON(storageKeys.contact, {
    name: name.value.trim(),
    email: email.value.trim()
  });
}

function restoreContactPreferences() {
  const saved = readJSON(storageKeys.contact, null);
  const name = document.getElementById('name');
  const email = document.getElementById('email');
  const notice = document.getElementById('storage-notice');
  if (!saved || !name || !email) return;

  if (saved.name) name.value = saved.name;
  if (saved.email) email.value = saved.email;
  if ((saved.name || saved.email) && notice) {
    notice.textContent = 'Welcome back — your saved contact details were restored from this browser.';
    notice.hidden = false;
  }
}

function initContactForm() {
  const form = document.getElementById('preorder-form');
  if (!form) return;

  restoreContactPreferences();

  ['name', 'email'].forEach(id => {
    document.getElementById(id).addEventListener('input', saveContactPreferences);
  });

  validationRules.forEach(rule => {
    const field = document.getElementById(rule.field);
    if (field) field.addEventListener('input', () => clearError(rule.field));
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    const status = document.getElementById('form-status');
    if (!validateContactForm()) {
      status.textContent = 'Please correct the highlighted fields before submitting.';
      status.className = 'form-status error-status';
      return;
    }

    saveContactPreferences();
    status.textContent = 'Your request looks ready. In a real bakery site, it would now be sent for confirmation.';
    status.className = 'form-status success-status';
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initFavorites();
  initContactForm();
});
