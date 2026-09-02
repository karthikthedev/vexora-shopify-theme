class CartRemoveButton extends HTMLElement {
  constructor() {
    super();

    this.addEventListener('click', (event) => {
      event.preventDefault();
      const cartItems = this.closest('cart-items') || this.closest('cart-drawer-items');
      // IMPORTANT: now using item key instead of line number
      cartItems.updateQuantity(this.dataset.key, 0, event);
    });
  }
}

customElements.define('cart-remove-button', CartRemoveButton);

class CartItems extends HTMLElement {
  constructor() {
    super();
    this.lineItemStatusElement =
      document.getElementById('shopping-cart-line-item-status') || document.getElementById('CartDrawer-LineItemStatus');

    const debouncedOnChange = debounce((event) => {
      this.onChange(event);
    }, ON_CHANGE_DEBOUNCE_TIMER);

    this.addEventListener('change', debouncedOnChange.bind(this));
  }

  cartUpdateUnsubscriber = undefined;

  connectedCallback() {
    this.cartUpdateUnsubscriber = subscribe(PUB_SUB_EVENTS.cartUpdate, (event) => {
      if (event.source === 'cart-items') return;
      return this.onCartUpdate();
    });
  }

  disconnectedCallback() {
    if (this.cartUpdateUnsubscriber) this.cartUpdateUnsubscriber();
  }

  resetQuantityInput(key) {
    const input = this.querySelector(`#Quantity-${key}`);
    input.value = input.getAttribute('value');
    this.isEnterPressed = false;
  }

  setValidity(event, key, message) {
    event.target.setCustomValidity(message);
    event.target.reportValidity();
    this.resetQuantityInput(key);
    event.target.select();
  }

  validateQuantity(event) {
    const inputValue = parseInt(event.target.value);
    const key = event.target.dataset.index;
    let message = '';

    if (inputValue < event.target.dataset.min) {
      message = window.quickOrderListStrings.min_error.replace('[min]', event.target.dataset.min);
    } else if (inputValue > parseInt(event.target.max)) {
      message = window.quickOrderListStrings.max_error.replace('[max]', event.target.max);
    } else if (inputValue % parseInt(event.target.step) !== 0) {
      message = window.quickOrderListStrings.step_error.replace('[step]', event.target.step);
    }

    if (message) {
      this.setValidity(event, key, message);
    } else {
      event.target.setCustomValidity('');
      event.target.reportValidity();
      this.updateQuantity(
        key,
        inputValue,
        event,
        document.activeElement.getAttribute('name'),
        event.target.dataset.quantityVariantId
      );
    }
  }

  onChange(event) {
    this.validateQuantity(event);
  }

  onCartUpdate() {
    if (this.tagName === 'CART-DRAWER-ITEMS') {
      return fetch(`${routes.cart_url}?section_id=cart-drawer`)
        .then((r) => r.text())
        .then((text) => {
          const html = new DOMParser().parseFromString(text, 'text/html');
          ['cart-drawer-items', '.cart-drawer__footer'].forEach((selector) => {
            const target = document.querySelector(selector);
            const source = html.querySelector(selector);
            if (target && source) target.replaceWith(source);
          });
        })
        .catch(console.error);
    } else {
      return fetch(`${routes.cart_url}?section_id=main-cart-items`)
        .then((r) => r.text())
        .then((text) => {
          const html = new DOMParser().parseFromString(text, 'text/html');
          const qty = html.querySelector('cart-items');
          this.innerHTML = qty.innerHTML;
        })
        .catch(console.error);
    }
  }

  getSectionsToRender() {
    return [
      {
        id: 'main-cart-items',
        section: document.getElementById('main-cart-items')?.dataset.id,
        selector: '.js-contents',
      },
      {
        id: 'cart-icon-bubble',
        section: 'cart-icon-bubble',
        selector: '.shopify-section',
      },
      {
        id: 'cart-live-region-text',
        section: 'cart-live-region-text',
        selector: '.shopify-section',
      },
      {
        id: 'main-cart-footer',
        section: document.getElementById('main-cart-footer')?.dataset.id,
        selector: '.js-contents',
      },
    ];
  }

  updateQuantity(key, quantity, event, name, variantId) {
    this.enableLoading(key);

    // 🔥 IMPORTANT FIX — use id (item.key) not line number
    const body = JSON.stringify({
      id: key,
      quantity,
      sections: this.getSectionsToRender().map((s) => s.section),
      sections_url: window.location.pathname,
    });

    const eventType = event.currentTarget instanceof CartRemoveButton ? 'clear' : 'change';

    fetch(`${routes.cart_change_url}`, { ...fetchConfig(), body })
      .then((r) => r.text())
      .then((state) => {
        const parsed = JSON.parse(state);

        CartPerformance.measure(`${eventType}:paint`, () => {
          const items = document.querySelectorAll('.cart-item');

          // Find updated item by key instead of index
          const updatedItem = parsed.items.find((i) => i.key === key);
          const updatedValue = updatedItem ? updatedItem.quantity : undefined;

          if (parsed.errors) {
            this.updateLiveRegions(key, parsed.errors);
            return;
          }

          this.classList.toggle('is-empty', parsed.item_count === 0);

          // replace rendered sections
          this.getSectionsToRender().forEach((section) => {
            const replaceTarget =
              document.getElementById(section.id).querySelector(section.selector) ||
              document.getElementById(section.id);
            replaceTarget.innerHTML = this.getSectionInnerHTML(
              parsed.sections[section.section],
              section.selector
            );
          });

          const message =
            items.length === parsed.items.length && updatedValue === undefined
              ? window.cartStrings.error
              : '';

          this.updateLiveRegions(key, message);
        });

        publish(PUB_SUB_EVENTS.cartUpdate, { source: 'cart-items', cartData: parsed, variantId });
      })
      .catch(() => {
        const errors = document.getElementById('cart-errors') || document.getElementById('CartDrawer-CartErrors');
        errors.textContent = window.cartStrings.error;
      })
      .finally(() => {
        this.disableLoading(key);
      });
  }

  updateLiveRegions(key, message) {
    const errorBox =
      document.getElementById(`Line-item-error-${key}`) ||
      document.getElementById(`CartDrawer-LineItemError-${key}`);

    if (errorBox) errorBox.querySelector('.cart-item__error-text').textContent = message;

    this.lineItemStatusElement.setAttribute('aria-hidden', true);

    const live = document.getElementById('cart-live-region-text') || document.getElementById('CartDrawer-LiveRegionText');
    live.setAttribute('aria-hidden', false);

    setTimeout(() => live.setAttribute('aria-hidden', true), 1000);
  }

  getSectionInnerHTML(html, selector) {
    return new DOMParser().parseFromString(html, 'text/html').querySelector(selector).innerHTML;
  }

  enableLoading(key) {
    const wrapper = document.getElementById('main-cart-items') || document.getElementById('CartDrawer-CartItems');
    wrapper.classList.add('cart__items--disabled');

    const spinners = [
      ...this.querySelectorAll(`#CartItem-${key} .loading__spinner`),
      ...this.querySelectorAll(`#CartDrawer-Item-${key} .loading__spinner`),
    ];

    spinners.forEach((s) => s.classList.remove('hidden'));
  }

  disableLoading(key) {
    const wrapper = document.getElementById('main-cart-items') || document.getElementById('CartDrawer-CartItems');
    wrapper.classList.remove('cart__items--disabled');

    const spinners = [
      ...this.querySelectorAll(`#CartItem-${key} .loading__spinner`),
      ...this.querySelectorAll(`#CartDrawer-Item-${key} .loading__spinner`),
    ];

    spinners.forEach((s) => s.classList.add('hidden'));
  }
}

customElements.define('cart-items', CartItems);
