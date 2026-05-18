const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.querySelector('.site-nav');
const year = document.querySelector('#year');
const filterButtons = document.querySelectorAll('.filter-button');
const galleryItems = document.querySelectorAll('.gallery-item');
const emptyGallery = document.querySelector('.empty-gallery');
const galleryGrid = document.querySelector('.categorized-gallery');
const collectionCards = document.querySelectorAll('[data-jump-filter]');
const productCards = document.querySelectorAll('.product-card[data-product]');
const bouquetModal = document.querySelector('#bouquet-modal');
const bouquetModalImage = document.querySelector('#bouquet-modal-image');
const bouquetModalTitle = document.querySelector('#bouquet-modal-title');
const bouquetModalDescription = document.querySelector('#bouquet-modal-description');
const bouquetCustomizer = document.querySelector('#bouquet-customizer');
const flowerColorInput = document.querySelector('#flower-color');
const stemColorInput = document.querySelector('#stem-color');
const bowColorInput = document.querySelector('#bow-color');
const bouquetSizeInput = document.querySelector('#bouquet-size');
const bouquetFlowerCountInput = document.querySelector('#bouquet-flower-count');
const bouquetPriceInput = document.querySelector('#bouquet-price');
const bouquetPriceSummary = document.querySelector('#bouquet-price-summary');
const bouquetSizeCards = document.querySelectorAll('.bouquet-size-card');
const colorOptions = document.querySelectorAll('.color-option');
const colorSelectionLimit = 3;
const colorSelectionCounters = document.querySelectorAll('[data-counter-for]');
const colorSelectionMessages = document.querySelectorAll('[data-message-for]');
const continuePaymentButton = document.querySelector('[data-continue-payment]');
const bouquetRequestQuoteButton = document.querySelector('[data-bouquet-request-quote]');
const bouquetCheckoutMessage = document.querySelector('#bouquet-checkout-message');
const closeBouquetModalButtons = document.querySelectorAll('[data-close-bouquet-modal]');
const quoteModal = document.querySelector('#quote-modal');
const quoteForm = document.querySelector('#quote-form');
const openQuoteModalButtons = document.querySelectorAll('[data-open-quote-modal]');
const closeQuoteModalButtons = document.querySelectorAll('[data-close-quote-modal]');
const bouquetCartStorageKey = 'gracefulBalloonCart';

function getStoredBouquetCart() {
  try {
    return JSON.parse(localStorage.getItem(bouquetCartStorageKey)) || [];
  } catch (error) {
    return [];
  }
}

function saveStoredBouquetCart(cartItems) {
  localStorage.setItem(bouquetCartStorageKey, JSON.stringify(cartItems));
}


if (year) {
  year.textContent = new Date().getFullYear();
}

const galleryCategoryOrder = [
  { key: 'bouquets', title: 'Balloon Bouquets' },
  { key: 'centerpieces', title: 'Centerpieces' },
  { key: 'arches-garlands', title: 'Arches & Garlands' },
  { key: 'columns-entrances', title: 'Columns & Entrances' },
  { key: 'custom-installations', title: 'Balloon Art' },
  { key: 'event-packages', title: 'Event Packages' },
  { key: 'baby-shower', title: 'Baby Shower' },
  { key: 'events', title: 'Events' }
];

function categoryTitleForItem(item) {
  const alt = item.querySelector('img')?.alt?.toLowerCase() || '';
  const category = item.dataset.category;

  if (category === 'custom-installations') {
    if (alt.includes('custom installations portfolio image 7') || alt.includes('custom installations portfolio image 8')) return 'event-packages';
    if (alt.includes('custom installations portfolio image 2')) return 'custom-installations';
    if (alt.includes('custom installations')) return 'events';
  }

  return category;
}

function buildCategorizedGallery() {
  if (!galleryGrid) return;

  const items = Array.from(galleryGrid.querySelectorAll('.gallery-item'));
  if (!items.length || galleryGrid.querySelector('.gallery-category-section')) return;

  const fragment = document.createDocumentFragment();
  let numberIndex = 1;

  galleryCategoryOrder.forEach(({ key, title }) => {
    const categoryItems = items.filter((item) => categoryTitleForItem(item) === key);
    if (!categoryItems.length) return;

    const section = document.createElement('section');
    section.className = 'gallery-category-section';
    section.setAttribute('aria-label', title);

    const heading = document.createElement('h3');
    heading.textContent = title;
    section.appendChild(heading);

    const grid = document.createElement('div');
    grid.className = 'gallery-category-grid';

    categoryItems.forEach((item) => {
      item.querySelector('figcaption')?.remove();
      item.querySelector('.gallery-number')?.remove();
      const number = document.createElement('span');
      number.className = 'gallery-number';
      number.textContent = `#${String(numberIndex).padStart(3, '0')}`;
      numberIndex += 1;
      item.appendChild(number);
      grid.appendChild(item);
    });

    section.appendChild(grid);
    fragment.appendChild(section);
  });

  galleryGrid.innerHTML = '';
  galleryGrid.appendChild(fragment);
}

buildCategorizedGallery();

function initializeGalleryLightbox() {
  const lightbox = document.querySelector('#gallery-lightbox');
  const lightboxImage = document.querySelector('#lightbox-image');
  if (!lightbox || !lightboxImage) return;

  const galleryTriggers = Array.from(document.querySelectorAll('[data-lightbox-src], .gallery-item img'));
  if (!galleryTriggers.length) return;

  const lightboxItems = galleryTriggers.map((trigger) => {
    const image = trigger.matches('img') ? trigger : trigger.querySelector('img');
    return {
      trigger,
      src: trigger.dataset.lightboxSrc || image?.getAttribute('src') || '',
      alt: image?.getAttribute('alt') || 'Gallery image'
    };
  }).filter((item) => item.src);

  let activeIndex = 0;
  let lastFocusedElement = null;

  function showImage(index) {
    activeIndex = (index + lightboxItems.length) % lightboxItems.length;
    const item = lightboxItems[activeIndex];
    lightboxImage.classList.remove('is-loaded');
    window.requestAnimationFrame(() => {
      lightboxImage.src = item.src;
      lightboxImage.alt = item.alt;
    });
  }

  function openLightbox(index) {
    lastFocusedElement = document.activeElement;
    showImage(index);
    lightbox.hidden = false;
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    window.requestAnimationFrame(() => lightbox.classList.add('is-open'));
    lightbox.querySelector('.lightbox-close')?.focus({ preventScroll: true });
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    window.setTimeout(() => {
      lightbox.hidden = true;
      lightboxImage.removeAttribute('src');
      if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
        lastFocusedElement.focus({ preventScroll: true });
      }
    }, 240);
  }

  function nextImage() {
    showImage(activeIndex + 1);
  }

  function previousImage() {
    showImage(activeIndex - 1);
  }

  galleryTriggers.forEach((trigger, index) => {
    const interactiveTarget = trigger.matches('button') ? trigger : trigger.closest('button');
    const target = interactiveTarget || trigger.closest('.gallery-item') || trigger;
    if (!target.matches('button')) {
      target.setAttribute('role', 'button');
      target.setAttribute('tabindex', '0');
    }
    target.classList.add('gallery-lightbox-trigger');

    target.addEventListener('click', (event) => {
      event.preventDefault();
      openLightbox(index);
    });

    target.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openLightbox(index);
      }
    });
  });

  lightboxImage.addEventListener('load', () => {
    lightboxImage.classList.add('is-loaded');
  });

  lightbox.querySelectorAll('[data-close-gallery-lightbox]').forEach((button) => {
    button.addEventListener('click', closeLightbox);
  });
  lightbox.querySelector('[data-gallery-lightbox-next]')?.addEventListener('click', nextImage);
  lightbox.querySelector('[data-gallery-lightbox-prev]')?.addEventListener('click', previousImage);

  document.addEventListener('keydown', (event) => {
    if (lightbox.hidden) return;
    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowRight') nextImage();
    if (event.key === 'ArrowLeft') previousImage();
  });
}

initializeGalleryLightbox();

if (navToggle && siteNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = siteNav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  siteNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      siteNav.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

function applyGalleryFilter(filter) {
  let visibleCount = 0;

  filterButtons.forEach((item) => {
    item.classList.toggle('is-active', item.getAttribute('data-filter') === filter);
  });

  galleryItems.forEach((item) => {
    const shouldShow = filter === 'all' || item.dataset.category === filter;
    item.classList.toggle('is-hidden', !shouldShow);
    if (shouldShow) visibleCount += 1;
  });

  if (emptyGallery) {
    emptyGallery.hidden = visibleCount !== 0;
  }
}

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    applyGalleryFilter(button.getAttribute('data-filter'));
  });
});

collectionCards.forEach((card) => {
  card.addEventListener('click', () => {
    if (card.matches('.product-card[data-product]')) return;
    const filter = card.getAttribute('data-jump-filter');
    applyGalleryFilter(filter);
  });
});

const bouquetProducts = {
  'flower-bouquet': {
    title: 'Flower Bouquet',
    description: 'Customize your balloon flower bouquet with your preferred size, colors, and finishing details.',
    image: 'images/bouquets/flower-bouquet-wide.jpg',
    alt: 'Flower Bouquet by Graceful Balloon Studio',
    colors: ['Blue', 'Ivory']
  }
};

function getColorOptionsForGroup(group) {
  return Array.from(colorOptions).filter((option) => option.dataset.group === group);
}

function getSelectedColorsForGroup(group) {
  return getColorOptionsForGroup(group)
    .filter((option) => option.classList.contains('is-selected'))
    .map((option) => option.dataset.color);
}

function getColorInputForGroup(group) {
  if (group === 'flower') return flowerColorInput;
  if (group === 'stem') return stemColorInput;
  if (group === 'bow') return bowColorInput;
  return null;
}

function updateColorSelectionState(group) {
  const selectedColors = getSelectedColorsForGroup(group);
  const input = getColorInputForGroup(group);
  const counter = Array.from(colorSelectionCounters).find((item) => item.dataset.counterFor === group);

  if (input) input.value = selectedColors.join(', ');
  if (counter) counter.textContent = `Selected: ${selectedColors.length}/${colorSelectionLimit}`;
}

function updateAllColorSelectionStates() {
  ['flower', 'stem', 'bow'].forEach(updateColorSelectionState);
}

function showColorLimitMessage(group) {
  const message = Array.from(colorSelectionMessages).find((item) => item.dataset.messageFor === group);
  if (!message) return;

  message.hidden = false;
  window.clearTimeout(Number(message.dataset.hideTimeout));
  const timeout = window.setTimeout(() => {
    message.hidden = true;
  }, 2200);
  message.dataset.hideTimeout = String(timeout);
}

function setSelectedGroupColors(group, colors) {
  const selectedColors = colors.slice(0, colorSelectionLimit);

  getColorOptionsForGroup(group).forEach((option) => {
    const isSelected = selectedColors.includes(option.dataset.color);
    option.classList.toggle('is-selected', isSelected);
    option.setAttribute('aria-pressed', String(isSelected));
  });

  updateColorSelectionState(group);
}

function toggleSelectedColor(group, color) {
  const groupOptions = getColorOptionsForGroup(group);
  const selectedOptions = groupOptions.filter((option) => option.classList.contains('is-selected'));
  const selectedOption = groupOptions.find((option) => option.dataset.color === color);
  if (!selectedOption) return;

  if (selectedOption.classList.contains('is-selected')) {
    selectedOption.classList.remove('is-selected');
    selectedOption.setAttribute('aria-pressed', 'false');
    updateColorSelectionState(group);
    return;
  }

  if (selectedOptions.length >= colorSelectionLimit) {
    showColorLimitMessage(group);
    return;
  }

  selectedOption.classList.add('is-selected');
  selectedOption.setAttribute('aria-pressed', 'true');
  updateColorSelectionState(group);
}

function setSelectedColors(colors) {
  const selectedColors = colors.length ? colors : ['White', 'Ivory'];
  setSelectedGroupColors('flower', [selectedColors[0] || 'White']);
  setSelectedGroupColors('stem', ['Eucalyptus', 'Sage']);
  setSelectedGroupColors('bow', [selectedColors[1] || selectedColors[0] || 'Ivory']);
}

function selectBouquetSize(card) {
  if (!card) return;

  const size = card.dataset.sizeOption;
  const flowerCount = card.dataset.flowerCount;
  const price = card.dataset.price;

  bouquetSizeCards.forEach((item) => {
    const isSelected = item === card;
    item.classList.toggle('is-selected', isSelected);
    item.setAttribute('aria-checked', String(isSelected));
  });

  if (bouquetSizeInput) bouquetSizeInput.value = size;
  if (bouquetFlowerCountInput) bouquetFlowerCountInput.value = flowerCount;
  if (bouquetPriceInput) bouquetPriceInput.value = price;
  if (bouquetPriceSummary) bouquetPriceSummary.textContent = `$${price} · ${size} (${flowerCount} flowers)`;
}

function resetBouquetSizeSelection() {
  const defaultCard = Array.from(bouquetSizeCards).find((card) => card.dataset.sizeOption === 'Classic') || bouquetSizeCards[0];
  selectBouquetSize(defaultCard);
}

function openBouquetModal(productId) {
  const product = bouquetProducts[productId];
  if (!product || !bouquetModal) return;

  if (bouquetModalImage) {
    bouquetModalImage.src = product.image;
    bouquetModalImage.alt = product.alt;
  }

  if (bouquetModalTitle) bouquetModalTitle.textContent = product.title;
  if (bouquetModalDescription) bouquetModalDescription.textContent = product.description;
  if (bouquetCustomizer) bouquetCustomizer.dataset.product = product.title;

  setSelectedColors(product.colors);
  resetBouquetSizeSelection();

  bouquetModal.hidden = false;
  bouquetModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
}

function closeBouquetModal() {
  if (!bouquetModal) return;
  bouquetModal.hidden = true;
  bouquetModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}

productCards.forEach((card) => {
  card.addEventListener('click', (event) => {
    event.preventDefault();
    openBouquetModal(card.dataset.product);
  });
});

bouquetSizeCards.forEach((card) => {
  card.addEventListener('click', () => {
    selectBouquetSize(card);
  });

  card.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      selectBouquetSize(card);
    }
  });
});

colorOptions.forEach((option) => {
  option.addEventListener('click', () => {
    toggleSelectedColor(option.dataset.group, option.dataset.color);
  });
});

updateAllColorSelectionStates();
resetBouquetSizeSelection();

function getBouquetValidationErrors(formData) {
  const errors = [];
  const quantity = Number(formData.get('quantity'));

  if (!formData.get('size')) errors.push('choose a bouquet size');
  if (!formData.get('flowerColor')) errors.push('select at least one flower color');
  if (!formData.get('stemColor')) errors.push('select at least one stem color');
  if (!formData.get('bowColor')) errors.push('select at least one bow color');
  if (!quantity || quantity < 1) errors.push('enter a quantity');

  return errors;
}

function showBouquetCheckoutMessage(message) {
  if (!bouquetCheckoutMessage) return;
  bouquetCheckoutMessage.textContent = message;
  bouquetCheckoutMessage.hidden = false;
  bouquetCheckoutMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function buildBouquetCartItem(formData) {
  const size = formData.get('size');
  const flowerCount = formData.get('flowerCount');
  const price = formData.get('price');

  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    product: bouquetCustomizer.dataset.product || 'Bouquet',
    size,
    flowerCount,
    price,
    sizeSummary: `$${price} · ${size} (${flowerCount} flowers)`,
    flowerColors: formData.get('flowerColor'),
    stemColors: formData.get('stemColor'),
    bowColors: formData.get('bowColor'),
    quantity: formData.get('quantity'),
    notes: formData.get('notes') || 'None'
  };
}

function buildBouquetQuoteSummary(formData) {
  const item = buildBouquetCartItem(formData);
  return [
    'Bouquet customization request:',
    `Product: ${item.product}`,
    `Size: ${item.sizeSummary}`,
    `Quantity: ${item.quantity || '1'}`,
    `Flower Colors: ${item.flowerColors || 'None'}`,
    `Stem Colors: ${item.stemColors || 'None'}`,
    `Bow Colors: ${item.bowColors || 'None'}`,
    `Bouquet Notes: ${item.notes || 'None'}`
  ].join('\n');
}

function saveBouquetQuoteDraft(summary) {
  try {
    sessionStorage.setItem('gracefulBalloonQuoteDraft', summary);
  } catch (error) {
    // Ignore storage limits/private mode; the quote form still opens.
  }
}

function applyBouquetQuoteDraft() {
  if (!quoteForm) return;

  let summary = '';
  try {
    summary = sessionStorage.getItem('gracefulBalloonQuoteDraft') || '';
  } catch (error) {
    summary = '';
  }

  if (!summary) return;

  const notesField = quoteForm.querySelector('textarea[name="Inspiration / Notes"]');
  if (!notesField || notesField.value.includes('Bouquet customization request:')) return;

  notesField.value = notesField.value ? `${notesField.value}\n\n${summary}` : summary;
}

if (continuePaymentButton) {
  continuePaymentButton.addEventListener('click', () => {
    const cartItems = getStoredBouquetCart();

    if (!cartItems.length) {
      showBouquetCheckoutMessage('Your cart is empty. Please add a bouquet before checkout.');
      return;
    }

    window.location.href = 'checkout.html';
  });
}

if (bouquetRequestQuoteButton && bouquetCustomizer) {
  bouquetRequestQuoteButton.addEventListener('click', () => {
    const formData = new FormData(bouquetCustomizer);
    const summary = buildBouquetQuoteSummary(formData);
    saveBouquetQuoteDraft(summary);
    closeBouquetModal();

    const contactSection = document.querySelector('#contact');
    contactSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });

    window.setTimeout(() => {
      openQuoteModal();
    }, 650);
  });
}

closeBouquetModalButtons.forEach((button) => {
  button.addEventListener('click', closeBouquetModal);
});

function openQuoteModal() {
  if (!quoteModal) return;
  applyBouquetQuoteDraft();
  quoteModal.hidden = false;
  quoteModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
}

function closeQuoteModal() {
  if (!quoteModal) return;
  quoteModal.hidden = true;
  quoteModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}

openQuoteModalButtons.forEach((button) => {
  button.addEventListener('click', openQuoteModal);
});

closeQuoteModalButtons.forEach((button) => {
  button.addEventListener('click', closeQuoteModal);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeBouquetModal();
    closeQuoteModal();
  }
});

if (bouquetCustomizer) {
  bouquetCustomizer.addEventListener('submit', (event) => {
    event.preventDefault();
    bouquetRequestQuoteButton?.click();
  });
}

if (quoteForm) {
  quoteForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(quoteForm);
    const subject = encodeURIComponent('Quote Request for Graceful Balloon Studio');
    const body = encodeURIComponent([
      `Name: ${formData.get('Name')}`,
      `Email: ${formData.get('Email')}`,
      `Phone Number: ${formData.get('Phone Number')}`,
      `Event Date: ${formData.get('Event Date')}`,
      `Event Location: ${formData.get('Event Location')}`,
      `Theme or Occasion: ${formData.get('Theme or Occasion')}`,
      `Desired Colors: ${formData.get('Desired Colors')}`,
      `Budget Range: ${formData.get('Budget Range')}`,
      `Inspiration / Notes: ${formData.get('Inspiration / Notes')}`,
      `Anything Else We Should Know?: ${formData.get('Anything Else We Should Know')}`,
      'Inspiration photos: Please attach files to this email before sending.'
    ].join('\n'));

    window.location.href = `mailto:gracefulballoonstudio@gmail.com?subject=${subject}&body=${body}`;
  });
}
