// Sepet Component'i
class CartComponent {
    constructor() {
        this.init();
    }

    init() {
        this.renderCartIcon();
        this.attachEventListeners();
    }

    renderCartIcon() {
        // Header'a sepet ikonunu ekle
        const header = document.querySelector('.header .nav');
        if (header && !document.querySelector('.cart-icon')) {
            const cartHTML = `
                <div class="nav-icons">
                    <a href="../pages/wishlist.html" class="nav-icon wishlist-icon">
                        <i class="fas fa-heart"></i>
                        <span class="wishlist-count">0</span>
                    </a>
                    <a href="../pages/cart.html" class="nav-icon cart-icon">
                        <i class="fas fa-shopping-cart"></i>
                        <span class="cart-count">0</span>
                    </a>
                </div>
            `;
            
            header.innerHTML += cartHTML;
            cartManager.updateCartIcon();
            cartManager.updateWishlistIcon();
        }
    }

    attachEventListeners() {
        // Sepet güncellemelerini dinle
        document.addEventListener('cartUpdated', (event) => {
            this.updateCartDisplay(event.detail);
        });

        document.addEventListener('wishlistUpdated', (event) => {
            this.updateWishlistDisplay(event.detail);
        });
    }

    updateCartDisplay(detail) {
        const cartCountElements = document.querySelectorAll('.cart-count');
        cartCountElements.forEach(element => {
            element.textContent = detail.count;
            element.style.display = detail.count > 0 ? 'flex' : 'none';
        });
    }

    updateWishlistDisplay(detail) {
        const wishlistCountElements = document.querySelectorAll('.wishlist-count');
        wishlistCountElements.forEach(element => {
            element.textContent = detail.count;
            element.style.display = detail.count > 0 ? 'flex' : 'none';
        });
    }

    // Ürün kartlarna sepete ekleme butonu ekle
    addToCartButtons() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.add-to-cart-btn')) {
                const button = e.target.closest('.add-to-cart-btn');
                const productId = parseInt(button.dataset.productId);
                const product = dataManager.getProduct(productId);
                
                if (product) {
                    cartManager.addToCart(product);
                }
            }

            if (e.target.closest('.wishlist-btn')) {
                const button = e.target.closest('.wishlist-btn');
                const productId = parseInt(button.dataset.productId);
                const product = dataManager.getProduct(productId);
                
                if (product) {
                    if (cartManager.isInWishlist(productId)) {
                        cartManager.removeFromWishlist(productId);
                        button.innerHTML = '<i class="far fa-heart"></i>';
                    } else {
                        cartManager.addToWishlist(product);
                        button.innerHTML = '<i class="fas fa-heart"></i>';
                    }
                }
            }
        });
    }

    // Quick cart modal'
    showQuickCart() {
        const cartItems = cartManager.getCartItems();
        const modalHTML = `
            <div class="quick-cart-modal">
                <div class="quick-cart-content">
                    <div class="quick-cart-header">
                        <h3>Sepetim (${cartItems.length})</h3>
                        <span class="close-quick-cart">&times;</span>
                    </div>
                    <div class="quick-cart-items">
                        ${cartItems.length === 0 ? 
                            '<div class="empty-cart">Sepetiniz bo</div>' : 
                            cartItems.map(item => this.createQuickCartItem(item)).join('')
                        }
                    </div>
                    ${cartItems.length > 0 ? `
                    <div class="quick-cart-footer">
                        <div class="cart-total">
                            <strong>Toplam: ${cartManager.getCartTotal().toLocaleString()}</strong>
                        </div>
                        <div class="cart-actions">
                            <a href="../pages/cart.html" class="btn btn--secondary">Sepete Git</a>
                            <a href="../pages/checkout.html" class="btn btn--primary">Satn Al</a>
                        </div>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;

        // Modal' göster
        this.showModal(modalHTML);
        this.attachQuickCartEvents();
    }

    createQuickCartItem(item) {
        return `
            <div class="quick-cart-item" data-product-id="${item.product.id}">
                <div class="item-image">${item.product.image}</div>
                <div class="item-info">
                    <div class="item-name">${item.product.name}</div>
                    <div class="item-price">${item.product.price.toLocaleString()} x ${item.quantity}</div>
                </div>
                <div class="item-actions">
                    <button class="remove-item" onclick="cartComponent.removeItem(${item.product.id})">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;
    }

    removeItem(productId) {
        cartManager.removeFromCart(productId);
        this.updateQuickCart();
    }

    updateQuickCart() {
        const quickCart = document.querySelector('.quick-cart-modal');
        if (quickCart) {
            quickCart.remove();
            this.showQuickCart();
        }
    }

    showModal(html) {
        // Mevcut modal' temizle
        const existingModal = document.querySelector('.quick-cart-modal');
        if (existingModal) {
            existingModal.remove();
        }

        // Yeni modal' ekle
        document.body.insertAdjacentHTML('beforeend', html);
        
        // Animasyon için
        setTimeout(() => {
            const modal = document.querySelector('.quick-cart-modal');
            if (modal) {
                modal.style.opacity = '1';
                modal.style.transform = 'translateY(0)';
            }
        }, 10);
    }

    attachQuickCartEvents() {
        const modal = document.querySelector('.quick-cart-modal');
        const closeBtn = document.querySelector('.close-quick-cart');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hideQuickCart();
            });
        }

        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideQuickCart();
                }
            });
        }

        // ESC tuu ile kapat
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideQuickCart();
            }
        });
    }

    hideQuickCart() {
        const modal = document.querySelector('.quick-cart-modal');
        if (modal) {
            modal.style.opacity = '0';
            modal.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                modal.remove();
            }, 300);
        }
    }
}

// Global instance
const cartComponent = new CartComponent();
