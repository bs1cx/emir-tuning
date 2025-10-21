// Sepet Sayfas Kontrolü
class CartPage {
    constructor() {
        this.init();
    }

    init() {
        this.loadCart();
        this.attachEventListeners();
        this.loadRecommendedProducts();
    }

    loadCart() {
        const cartItems = cartManager.getCartItems();
        this.renderCartItems(cartItems);
        this.updateOrderSummary();
    }

    renderCartItems(cartItems) {
        const cartContainer = document.getElementById('cartItems');
        const emptyCart = document.getElementById('emptyCart');
        const itemsCount = document.getElementById('cartItemsCount');
        const checkoutBtn = document.getElementById('checkoutBtn');

        if (cartItems.length === 0) {
            cartContainer.style.display = 'none';
            emptyCart.style.display = 'block';
            checkoutBtn.disabled = true;
            itemsCount.textContent = '0 ürün';
            return;
        }

        cartContainer.style.display = 'block';
        emptyCart.style.display = 'none';
        checkoutBtn.disabled = false;
        itemsCount.textContent = `${cartItems.length} ürün`;

        cartContainer.innerHTML = cartItems.map(item => this.createCartItem(item)).join('');
    }

    createCartItem(item) {
        const totalPrice = item.product.price * item.quantity;
        
        return `
            <div class="cart-item" data-product-id="${item.product.id}">
                <div class="item-image">
                    ${item.product.image}
                </div>
                
                <div class="item-details">
                    <h4 class="item-title">${item.product.name}</h4>
                    <p class="item-category">${item.product.category}  ${item.product.subcategory}</p>
                    <p class="item-brand">Marka: ${item.product.brand}</p>
                    
                    <div class="item-features">
                        ${item.product.features.map(feature => 
                            `<span class="feature-tag">${feature}</span>`
                        ).join('')}
                    </div>

                    <div class="item-actions">
                        <button class="btn-wishlist" onclick="cartPage.moveToWishlist(${item.product.id})">
                            <i class="far fa-heart"></i> Favorilere Ta
                        </button>
                        <button class="btn-remove" onclick="cartPage.removeItem(${item.product.id})">
                            <i class="fas fa-trash"></i> Kaldr
                        </button>
                    </div>
                </div>

                <div class="item-controls">
                    <div class="quantity-controls">
                        <button class="qty-btn" onclick="cartPage.decreaseQuantity(${item.product.id})">
                            <i class="fas fa-minus"></i>
                        </button>
                        <input type="number" 
                               class="qty-input" 
                               value="${item.quantity}" 
                               min="1" 
                               max="10"
                               onchange="cartPage.updateQuantity(${item.product.id}, this.value)">
                        <button class="qty-btn" onclick="cartPage.increaseQuantity(${item.product.id})">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>

                <div class="item-pricing">
                    <div class="price-unit">${item.product.price.toLocaleString()}</div>
                    <div class="price-total">${totalPrice.toLocaleString()}</div>
                </div>
            </div>
        `;
    }

    updateOrderSummary() {
        const subtotal = cartManager.getCartTotal();
        const shipping = subtotal >= 500 ? 0 : 49.90;
        const tax = subtotal * 0.18;
        const total = subtotal + shipping + tax;

        document.getElementById('subtotal').textContent = `${subtotal.toLocaleString()}`;
        document.getElementById('shipping').textContent = shipping === 0 ? 'ÜCRETSZ' : `${shipping.toLocaleString()}`;
        document.getElementById('tax').textContent = `${tax.toLocaleString()}`;
        document.getElementById('total').textContent = `${total.toLocaleString()}`;

        // Kargo bildirimini güncelle
        const shippingNotice = document.querySelector('.shipping-notice');
        if (subtotal >= 500) {
            shippingNotice.innerHTML = '<i class="fas fa-check-circle"></i><span>Ücretsiz kargo uyguland</span>';
            shippingNotice.style.color = '#4CAF50';
        } else {
            const remaining = 500 - subtotal;
            shippingNotice.innerHTML = `<i class="fas fa-truck"></i><span>Ücretsiz kargo için ${remaining.toFixed(2)} daha ekleyin</span>`;
            shippingNotice.style.color = '#666';
        }
    }

    // MKTAR KONTROLLER

    increaseQuantity(productId) {
        const item = cartManager.getCartItems().find(item => item.product.id === productId);
        if (item && item.quantity < 10) {
            cartManager.updateQuantity(productId, item.quantity + 1);
            this.loadCart();
        }
    }

    decreaseQuantity(productId) {
        const item = cartManager.getCartItems().find(item => item.product.id === productId);
        if (item && item.quantity > 1) {
            cartManager.updateQuantity(productId, item.quantity - 1);
            this.loadCart();
        }
    }

    updateQuantity(productId, newQuantity) {
        const quantity = parseInt(newQuantity);
        if (quantity >= 1 && quantity <= 10) {
            cartManager.updateQuantity(productId, quantity);
            this.loadCart();
        } else {
            // Geçersiz miktar, eski deere dön
            this.loadCart();
        }
    }

    removeItem(productId) {
        if (confirm('Bu ürünü sepetinizden kaldrmak istediinizden emin misiniz?')) {
            cartManager.removeFromCart(productId);
            this.loadCart();
        }
    }

    moveToWishlist(productId) {
        const product = dataManager.getProduct(productId);
        if (product) {
            cartManager.addToWishlist(product);
            cartManager.removeFromCart(productId);
            this.loadCart();
            cartManager.showNotification('Ürün favorilere tand!', 'success');
        }
    }

    clearCart() {
        if (confirm('Sepetinizdeki tüm ürünleri kaldrmak istediinizden emin misiniz?')) {
            cartManager.clearCart();
            this.loadCart();
        }
    }

    attachEventListeners() {
        // Checkout butonu
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                window.location.href = 'checkout.html';
            });
        }

        // Sepet güncellemelerini dinle
        document.addEventListener('cartUpdated', () => {
            this.loadCart();
        });
    }

    loadRecommendedProducts() {
        const container = document.getElementById('recommendedProducts');
        if (!container) return;

        const cartItems = cartManager.getCartItems();
        if (cartItems.length === 0) {
            // Sepet bosa rastgele ürünler göster
            const allProducts = dataManager.getProducts();
            const randomProducts = this.shuffleArray([...allProducts]).slice(0, 4);
            this.renderRecommendedProducts(randomProducts, container);
            return;
        }

        // Sepetteki ürünlerin kategorilerine göre öneri yap
        const cartCategories = [...new Set(cartItems.map(item => item.product.category))];
        const recommendedProducts = [];
        
        cartCategories.forEach(category => {
            const categoryProducts = dataManager.getProductsByCategory(category)
                .filter(product => !cartItems.some(item => item.product.id === product.id))
                .slice(0, 2);
            recommendedProducts.push(...categoryProducts);
        });

        // Eer yeterli ürün yoksa, rastgele ekle
        if (recommendedProducts.length < 4) {
            const allProducts = dataManager.getProducts();
            const additionalProducts = allProducts
                .filter(product => !recommendedProducts.some(rec => rec.id === product.id) &&
                                  !cartItems.some(item => item.product.id === product.id))
                .slice(0, 4 - recommendedProducts.length);
            recommendedProducts.push(...additionalProducts);
        }

        this.renderRecommendedProducts(recommendedProducts.slice(0, 4), container);
    }

    renderRecommendedProducts(products, container) {
        if (products.length === 0) return;

        container.innerHTML = products.map(product => `
            <div class="product-card recommended-card">
                <div class="product-image">${product.image}</div>
                <div class="product-info">
                    <h4>${product.name}</h4>
                    <p class="product-category">${product.category}</p>
                    <div class="product-price">${product.price.toLocaleString()}</div>
                    <div class="product-actions">
                        <button class="btn btn--primary btn--small add-to-cart-btn" 
                                data-product-id="${product.id}">
                            <i class="fas fa-cart-plus"></i> Sepete Ekle
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        // Sepete ekle butonlarna event listener ekle
        this.attachAddToCartListeners();
    }

    attachAddToCartListeners() {
        document.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = parseInt(e.target.closest('.add-to-cart-btn').dataset.productId);
                const product = dataManager.getProduct(productId);
                
                if (product) {
                    cartManager.addToCart(product);
                    // Butonu güncelle
                    e.target.innerHTML = '<i class="fas fa-check"></i> Eklendi';
                    e.target.disabled = true;
                    
                    setTimeout(() => {
                        e.target.innerHTML = '<i class="fas fa-cart-plus"></i> Sepete Ekle';
                        e.target.disabled = false;
                    }, 2000);
                }
            });
        });
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}

// Sayfa yüklendiinde balat
document.addEventListener('DOMContentLoaded', () => {
    window.cartPage = new CartPage();
});
