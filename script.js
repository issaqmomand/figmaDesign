document.addEventListener('DOMContentLoaded', () => {
  // Smooth scrolling for in-page anchors
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', event => {
      const href = anchor.getAttribute('href');
      const target = href && href.startsWith('#')
        ? document.querySelector(href)
        : null;
      if (target) {
        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  const CART_KEY = 'paradise_cart_v1';

  function loadCart() {
    try {
      const raw = localStorage.getItem(CART_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function saveCart(cart) {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {
      // ignore
    }
  }

  let cart = loadCart();
  const SHIPPING_FEE = 4.99;
  const TAX_RATE = 0.18;
  let fulfillmentMode = 'delivery'; // 'delivery' or 'pickup' (payment page only)

  // Simple page loading bar helpers
  let loaderEl = null;
  function ensureLoader() {
    if (loaderEl) return loaderEl;
    loaderEl = document.createElement('div');
    loaderEl.className = 'page-loader';
    loaderEl.innerHTML = '<div class="page-loader-bar"></div>';
    document.body.appendChild(loaderEl);
    return loaderEl;
  }

  function showPageLoader() {
    const el = ensureLoader();
    el.classList.add('show');
  }

  function hidePageLoader() {
    if (!loaderEl) return;
    loaderEl.classList.remove('show');
  }

  function formatPrice(value) {
    return `$${value.toFixed(2)}`;
  }

  function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const isPaymentPage = document.body.classList.contains('payment-body');
    const isPickupMode = isPaymentPage && !!document.querySelector('.delivery-btn.active[data-option="pickup"]');
    const deliveryFee = subtotal > 0 && !isPickupMode ? SHIPPING_FEE : 0;
    const tax = subtotal * TAX_RATE;
    const total = subtotal + deliveryFee + tax;

    // Update count badges wherever they appear
    document.querySelectorAll('[data-cart-count]').forEach(el => {
      el.textContent = totalItems;
    });

    // Small cart panel (header dropdown)
    const panelItems = document.getElementById('cartItems');
    const panelTotal = document.getElementById('cartTotal');
    if (panelItems && panelTotal) {
      if (cart.length === 0) {
        panelItems.innerHTML = '<li class="cart-item"><span class="cart-item-name">Your cart is empty.</span></li>';
        panelTotal.textContent = '$0.00';
      } else {
        panelItems.innerHTML = cart.map(item => `
          <li class="cart-item">
            <span class="cart-item-name">${item.name}</span>
            <span class="cart-item-qty">x${item.quantity}</span>
            <span class="cart-item-price">${formatPrice(item.price * item.quantity)}</span>
          </li>
        `).join('');
        panelTotal.textContent = formatPrice(total);
      }
    }

    // Checkout page detailed list + summary
    const checkoutItems = document.getElementById('checkoutItems');
    const checkoutItemCount = document.getElementById('checkoutItemCount');
    const checkoutSubtotal = document.getElementById('checkoutSubtotal');
    const checkoutDelivery = document.getElementById('checkoutDelivery');
    const checkoutTax = document.getElementById('checkoutTax');
    const checkoutTotal = document.getElementById('checkoutTotal');

    if (checkoutItems && checkoutItemCount && checkoutSubtotal && checkoutDelivery && checkoutTax && checkoutTotal) {
      checkoutItemCount.textContent = totalItems;

      if (cart.length === 0) {
        checkoutItems.innerHTML = '<p class="checkout-empty">Your cart is empty.</p>';
      } else {
        checkoutItems.innerHTML = cart.map((item, index) => `
          <article class="checkout-item" data-index="${index}">
            <img class="checkout-thumb" src="${item.image || 'assets/images/checkout-image-1.png'}" alt="${item.name}">
            <div class="checkout-item-info">
              <h4>${item.name}</h4>
              <p class="checkout-item-desc">Food description</p>
              <div class="checkout-item-meta">
                <span class="checkout-item-price">${formatPrice(item.price)}</span>
                <div class="checkout-qty">
                  <button type="button" class="qty-btn" data-action="dec" aria-label="Decrease quantity">−</button>
                  <span class="qty-value">${item.quantity}</span>
                  <button type="button" class="qty-btn" data-action="inc" aria-label="Increase quantity">+</button>
                </div>
                <span class="checkout-line-total">${formatPrice(item.price * item.quantity)}</span>
              </div>
            </div>
          </article>
        `).join('');
      }

      checkoutSubtotal.textContent = formatPrice(subtotal);
      checkoutDelivery.textContent = formatPrice(deliveryFee);
      checkoutTax.textContent = formatPrice(tax);
      checkoutTotal.textContent = formatPrice(total);
    }

    const paymentCartList = document.getElementById('paymentCartList');
    const paymentSubtotal = document.getElementById('paymentSubtotal');
    const paymentShipping = document.getElementById('paymentShipping');
    const paymentTax = document.getElementById('paymentTax');
    const paymentTotal = document.getElementById('paymentTotal');
    const paymentShippingLabel = document.getElementById('paymentShippingLabel');

    if (paymentCartList && paymentSubtotal && paymentShipping && paymentTax && paymentTotal) {
      if (cart.length === 0) {
        paymentCartList.innerHTML = '<p class="checkout-empty">Your cart is empty.</p>';
      } else {
        paymentCartList.innerHTML = cart.map(item => `
          <div class="payment-cart-item">
            <img class="payment-cart-thumb" src="${item.image || 'assets/images/checkout-image-1.png'}" alt="${item.name}">
            <div class="payment-cart-info">
              <span>${item.name} x${item.quantity}</span>
              <span>${formatPrice(item.price * item.quantity)}</span>
            </div>
          </div>
        `).join('');
      }

      paymentSubtotal.textContent = formatPrice(subtotal);
      paymentShipping.textContent = formatPrice(deliveryFee);
      paymentTax.textContent = formatPrice(tax);
      paymentTotal.textContent = formatPrice(total);

      if (paymentShippingLabel) {
        paymentShippingLabel.textContent = isPickupMode ? 'Pickup' : 'Estimated Shipping';
      }
    }
  }

  function addToCart(name, price, image) {
    const existing = cart.find(item => item.name === name && item.price === price);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ name, price, quantity: 1, image });
    }
    saveCart(cart);
    updateCartUI();
  }

  function updateQuantity(index, delta) {
    if (index < 0 || index >= cart.length) return;
    cart[index].quantity += delta;
    if (cart[index].quantity <= 0) {
      cart.splice(index, 1);
    }
    saveCart(cart);
    updateCartUI();
  }

  // Toast notification system
  function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);

    // Remove after 3 seconds
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // Wire up Add to Cart buttons on the menu page
  document.querySelectorAll('.add-cart').forEach(button => {
    button.addEventListener('click', () => {
      const name = button.getAttribute('data-name') || 'Menu item';
      const priceValue = parseFloat(button.getAttribute('data-price') || '0');
      const relatedThumb = button.closest('.menu-item')?.querySelector('.menu-thumb');
      const imageSrc = relatedThumb ? relatedThumb.getAttribute('src') : undefined;
      addToCart(name, priceValue, imageSrc);

      // Visual feedback
      button.classList.add('added');
      setTimeout(() => button.classList.remove('added'), 300);

      // Toast notification
      showToast(`✓ ${name} added to cart!`, 'success');
    });
  });

  // Checkout quantity controls
  const checkoutItems = document.getElementById('checkoutItems');
  if (checkoutItems) {
    checkoutItems.addEventListener('click', (event) => {
      const btn = event.target.closest('.qty-btn');
      if (!btn) return;
      const action = btn.getAttribute('data-action');
      const itemEl = btn.closest('.checkout-item');
      const index = itemEl ? parseInt(itemEl.getAttribute('data-index') || '-1', 10) : -1;
      if (Number.isNaN(index)) return;
      if (action === 'inc') updateQuantity(index, 1);
      if (action === 'dec') updateQuantity(index, -1);
    });
  }

  // Promo code (simple example)
  const applyPromoBtn = document.getElementById('applyPromo');
  const promoInput = document.getElementById('promoCode');
  const promoMessage = document.getElementById('promoMessage');

  if (applyPromoBtn && promoInput && promoMessage) {
    applyPromoBtn.addEventListener('click', () => {
      const code = promoInput.value.trim().toUpperCase();
      if (!code) {
        promoMessage.textContent = 'Please enter a promo code.';
        return;
      }
      // Placeholder logic – real discounts would be handled server-side
      promoMessage.textContent = code === 'PARADISE10'
        ? 'Promo applied: 10% off will be reflected at payment.'
        : 'This promo code is not valid.';
    });
  }

  // Place order button (demo)
  const placeOrderBtn = document.getElementById('placeOrder');
  if (placeOrderBtn) {
    placeOrderBtn.addEventListener('click', () => {
      if (!cart.length) {
        alert('Your cart is empty.');
        return;
      }
      showPageLoader();
      setTimeout(() => {
        window.location.href = 'payment.html';
      }, 500);
    });
  }

  const deliveryToggle = document.getElementById('deliveryToggle');
  const paymentMethodSelect = document.getElementById('paymentMethod');
  const cardFields = document.getElementById('cardFields');
  const cardNumberInput = document.querySelector('input[name="cardNumber"]');
  const cvvInput = document.querySelector('input[name="cvv"]');
  const completePaymentBtn = document.getElementById('completePayment');
  const savePaymentBtn = document.getElementById('savePaymentDetails');

  function updateFulfillmentUI() {
    const isPickup = !!document.querySelector('.delivery-btn.active[data-option="pickup"]');
    fulfillmentMode = isPickup ? 'pickup' : 'delivery';

    const paymentMethodRow = document.getElementById('paymentMethodRow');
    const nameRow = document.getElementById('nameRow');
    const contactRow = document.getElementById('contactRow');
    const addressRows = document.querySelectorAll('.address-fields-row');

    // Always show payment method row (for both pickup and delivery)
    if (paymentMethodRow) {
      paymentMethodRow.style.display = '';
    }
    // Always show name row
    if (nameRow) {
      nameRow.style.display = '';
    }
    // Always show contact row (needed for order confirmation for both pickup and delivery)
    if (contactRow) {
      contactRow.style.display = '';
    }
    // Hide address rows only for pickup
    addressRows.forEach(row => {
      row.style.display = isPickup ? 'none' : '';
    });
    // Show card fields based on payment method for both pickup and delivery
    if (cardFields) {
      const isCard = paymentMethodSelect && paymentMethodSelect.value === 'card';
      cardFields.style.display = isCard ? 'grid' : 'none';
    }
    if (completePaymentBtn) {
      completePaymentBtn.textContent = isPickup ? 'Place Pickup Order' : 'Complete Payment';
    }
  }

  if (deliveryToggle) {
    deliveryToggle.addEventListener('click', (event) => {
      const btn = event.target.closest('.delivery-btn');
      if (!btn) return;
      deliveryToggle.querySelectorAll('.delivery-btn').forEach(button => button.classList.remove('active'));
      btn.classList.add('active');
      updateFulfillmentUI();
      updateCartUI(); // refresh totals/shipping
    });

    // Initialize UI on payment page load
    updateFulfillmentUI();
  }

  function syncCardFields() {
    if (!paymentMethodSelect || !cardFields) return;
    // Show card fields for both pickup and delivery when card payment is selected
    const isCard = paymentMethodSelect.value === 'card';
    cardFields.style.display = isCard ? 'grid' : 'none';
    if (cardNumberInput) {
      cardNumberInput.type = isCard ? 'password' : 'text';
    }
    if (cvvInput) {
      cvvInput.type = 'password';
    }
  }

  if (paymentMethodSelect) {
    paymentMethodSelect.addEventListener('change', () => {
      syncCardFields();
      // Also update fulfillment UI to ensure everything is in sync
      if (deliveryToggle) {
        updateFulfillmentUI();
      }
    });
    syncCardFields();
  }

  if (savePaymentBtn) {
    savePaymentBtn.addEventListener('click', () => {
      // Validate form before saving
      const validation = validatePaymentForm();
      if (!validation.isValid) {
        showToast(validation.errors[0] || 'Please fill in all required fields.', 'error');
        // Scroll to first error
        const firstError = document.querySelector('.payment-form input.error, .payment-form select.error');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
          firstError.focus();
        }
        return;
      }
      
      showToast('Your delivery and payment preferences have been saved.', 'success');
    });
  }

  // Form validation for payment page
  function validatePaymentForm() {
    const isPickup = !!document.querySelector('.delivery-btn.active[data-option="pickup"]');

    // Required fields for both pickup and delivery
    const requiredFields = [
      { selector: 'input[name="firstName"]', name: 'First Name' },
      { selector: 'input[name="lastName"]', name: 'Last Name' },
      { selector: 'input[name="email"]', name: 'Email' },
      { selector: 'input[name="phone"]', name: 'Phone' }
    ];

    // For delivery orders, also require address details
    if (!isPickup) {
      requiredFields.push(
        { selector: 'input[name="street"]', name: 'Street Address' },
        { selector: 'input[name="city"]', name: 'City' },
        { selector: 'input[name="postal"]', name: 'Postal Code' }
      );
    }

    let isValid = true;
    const errors = [];

    requiredFields.forEach(field => {
      const input = document.querySelector(field.selector);
      if (input) {
        const value = input.value.trim();
        input.classList.remove('error');
        
        if (!value) {
          input.classList.add('error');
          errors.push(`${field.name} is required`);
          isValid = false;
        } else if (field.selector.includes('email')) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            input.classList.add('error');
            errors.push('Please enter a valid email address');
            isValid = false;
          }
        } else if (field.selector.includes('phone')) {
          const phoneRegex = /^[\d\s\-\(\)]+$/;
          if (!phoneRegex.test(value) || value.replace(/\D/g, '').length < 10) {
            input.classList.add('error');
            errors.push('Please enter a valid phone number');
            isValid = false;
          }
        }
      }
    });

    // Validate card fields for both pickup and delivery when card payment is selected
    const paymentMethod = document.getElementById('paymentMethod');
    if (paymentMethod && paymentMethod.value === 'card') {
      const cardNumber = document.querySelector('input[name="cardNumber"]');
      const cardExpiry = document.querySelector('input[name="expiry"]');
      const cvv = document.querySelector('input[name="cvv"]');

      if (cardNumber && !cardNumber.value.trim()) {
        cardNumber.classList.add('error');
        errors.push('Card number is required');
        isValid = false;
      }
      if (cardExpiry && !cardExpiry.value.trim()) {
        cardExpiry.classList.add('error');
        errors.push('Expiration date is required');
        isValid = false;
      }
      if (cvv && (!cvv.value.trim() || cvv.value.length < 3)) {
        cvv.classList.add('error');
        errors.push('CVV is required (3 digits)');
        isValid = false;
      }
    }

    return { isValid, errors };
  }

  // Clear error state when user starts typing
  const paymentForm = document.querySelector('.payment-form');
  if (paymentForm) {
    paymentForm.addEventListener('input', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') {
        e.target.classList.remove('error');
      }
    });
  }

  if (completePaymentBtn) {
    completePaymentBtn.addEventListener('click', () => {
      if (!cart.length) {
        showToast('Your cart is empty.', 'error');
        return;
      }

      const validation = validatePaymentForm();
      if (!validation.isValid) {
        showToast(validation.errors[0] || 'Please fill in all required fields.', 'error');
        // Scroll to first error
        const firstError = document.querySelector('.payment-form input.error, .payment-form select.error');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
          firstError.focus();
        }
        return;
      }

      const isPickup = !!document.querySelector('.delivery-btn.active[data-option="pickup"]');
      const successMessage = isPickup
        ? 'Your pickup order has been placed! We’ll have it ready shortly.'
        : 'Payment successful! Your order is on its way.';

      showToast(successMessage, 'success');
      cart = [];
      saveCart(cart);
      updateCartUI();
      setTimeout(() => {
        showPageLoader();
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 400);
      }, 1500);
    });
  }

  // Cart panel hover + click-to-checkout
  const cartPanel = document.getElementById('cartPanel');
  document.querySelectorAll('.cart-button').forEach(button => {
    if (cartPanel) {
      button.addEventListener('mouseenter', () => {
        cartPanel.classList.add('open');
      });
      button.addEventListener('mouseleave', () => {
        cartPanel.classList.remove('open');
      });
      cartPanel.addEventListener('mouseenter', () => {
        cartPanel.classList.add('open');
      });
      cartPanel.addEventListener('mouseleave', () => {
        cartPanel.classList.remove('open');
      });
    }

    button.addEventListener('click', () => {
      showPageLoader();
      setTimeout(() => {
        window.location.href = 'checkout.html';
      }, 400);
    });
  });

  updateCartUI();

  // Final initialization: ensure payment page UI is properly set up
  if (deliveryToggle && paymentMethodSelect) {
    // Make sure everything is synced on page load
    updateFulfillmentUI();
    syncCardFields();
  }

  // Hide loader if user lands on a page directly (e.g., refresh, url nav)
  window.addEventListener('load', () => {
    hidePageLoader();
    // Re-initialize payment UI after page fully loads
    if (deliveryToggle && paymentMethodSelect) {
      updateFulfillmentUI();
      syncCardFields();
    }
  });
});
