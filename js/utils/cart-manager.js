// Sepet Yönetim Sistemi
class CartManager {
    constructor() {
        this.cart = this.loadCart();
        this.wishlist = this.loadWishlist();
        this.init();
    }

    init() {
        this.updateCartIcon();
    }

    // SEPET LEMLER

    loadCart() {
        const savedCart = localStorage.getItem('emirTuningCart');
        return savedCart ? JSON.parse(savedCart) : [];
    }

    saveCart() {
        localStorage.setItem('emirTuningCart', JSON.stringify(this.cart));
        this.updateCartIcon();
        this.dispatchCartUpdate();
    }

    addToCart(product, quantity = 1) {
        const existingItem = this.cart.find(item => item.product.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cart.push({
                product: product,
                quantity: quantity,
                addedAt: new Date().toISOString()
            });
        }
        
        this.saveCart();
        this.showNotification(`${product.name} sepete eklendi!`, 'success');
        return true;
    }

    updateQuantity(productId, quantity) {
        const item = this.cart.find(item => item.product.id === productId);
        
        if (item) {
            if (quantity <= 0) {
                this.removeFromCart(productId);
            } else {
                item.quantity = quantity;
                this.saveCart();
            }
        }
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.product.id !== productId);
        this.saveCart();
        this.showNotification('Ürün sepetten kaldrld!', 'info');
    }

    clearCart() {
        this.cart = [];
        this.saveCart();
    }

    getCartItems() {
        return this.cart;
    }

    getCartTotal() {
        return this.cart.reduce((total, item) => {
            return total + (item.product.price * item.quantity);
        }, 0);
    }

    getCartCount() {
        return this.cart.reduce((total, item) => total + item.quantity, 0);
    }

    // FAVORLER LEMLER

    loadWishlist() {
        const savedWishlist = localStorage.getItem('emirTuningWishlist');
        return savedWishlist ? JSON.parse(savedWishlist) : [];
    }

    saveWishlist() {
        localStorage.setItem('emirTuningWishlist', JSON.stringify(this.wishlist));
        this.updateWishlistIcon();
        this.dispatchWishlistUpdate();
    }

    addToWishlist(product) {
        if (!this.isInWishlist(product.id)) {
            this.wishlist.push({
                product: product,
                addedAt: new Date().toISOString()
            });
            this.saveWishlist();
            this.showNotification(`${product.name} favorilere eklendi!`, 'success');
            return true;
        }
        return false;
    }

    removeFromWishlist(productId) {
        this.wishlist = this.wishlist.filter(item => item.product.id !== productId);
        this.saveWishlist();
        this.showNotification('Ürün favorilerden kaldrld!', 'info');
    }

    isInWishlist(productId) {
        return this.wishlist.some(item => item.product.id === productId);
    }

    getWishlistItems() {
        return this.wishlist;
    }

    getWishlistCount() {
        return this.wishlist.length;
    }

    // ORTAK LEMLER

    updateCartIcon() {
        const cartCountElements = document.querySelectorAll('.cart-count');
        const count = this.getCartCount();
        
        cartCountElements.forEach(element => {
            element.textContent = count;
            element.style.display = count > 0 ? 'flex' : 'none';
        });
    }

    updateWishlistIcon() {
        const wishlistCountElements = document.querySelectorAll('.wishlist-count');
        const count = this.getWishlistCount();
        
        wishlistCountElements.forEach(element => {
            element.textContent = count;
            element.style.display = count > 0 ? 'flex' : 'none';
        });
    }

    dispatchCartUpdate() {
        const event = new CustomEvent('cartUpdated', {
            detail: { cart: this.cart, total: this.getCartTotal(), count: this.getCartCount() }
        });
        document.dispatchEvent(event);
    }

    dispatchWishlistUpdate() {
        const event = new CustomEvent('wishlistUpdated', {
            detail: { wishlist: this.wishlist, count: this.getWishlistCount() }
        });
        document.dispatchEvent(event);
    }

    showNotification(message, type = 'info') {
        // Basit notification sistemi
        if (typeof Toastify !== 'undefined') {
            Toastify({
                text: message,
                duration: 3000,
                gravity: "top",
                position: "right",
                backgroundColor: type === 'success' ? "#4CAF50" : 
                              type === 'error' ? "#f44336" : "#2196F3",
            }).showToast();
        } else {
            // Fallback alert
            alert(message);
        }
    }

    // SPAR LEMLER

    createOrder(customerInfo, shippingInfo) {
        const order = {
            id: this.generateOrderId(),
            items: this.cart,
            total: this.getCartTotal(),
            customer: customerInfo,
            shipping: shippingInfo,
            status: 'pending',
            createdAt: new Date().toISOString(),
            orderNumber: this.generateOrderNumber()
        };

        // Siparileri kaydet
        const orders = this.loadOrders();
        orders.push(order);
        localStorage.setItem('emirTuningOrders', JSON.stringify(orders));

        // Sepeti temizle
        this.clearCart();

        return order;
    }

    loadOrders() {
        const savedOrders = localStorage.getItem('emirTuningOrders');
        return savedOrders ? JSON.parse(savedOrders) : [];
    }

    generateOrderId() {
        return 'ORD_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    generateOrderNumber() {
        return 'EMT' + Date.now().toString().slice(-8);
    }

    // STOK KONTROLÜ

    checkStock(productId, quantity = 1) {
        const product = dataManager.getProduct(productId);
        if (!product) return false;
        
        // Basit stok kontrolü - gerçek uygulamada daha karmak olabilir
        return product.inStock;
    }

    getAvailableStock(productId) {
        const product = dataManager.getProduct(productId);
        return product ? (product.inStock ? 999 : 0) : 0; // Basit implementasyon
    }
}

// Global instance
const cartManager = new CartManager();

// WhatsApp sipari fonksiyonu
createWhatsAppOrder(customerInfo, shippingInfo) {
    const cartItems = this.getCartItems();
    const subtotal = this.getCartTotal();
    const shipping = subtotal >= 500 ? 0 : 49.90;
    const tax = subtotal * 0.18;
    const total = subtotal + shipping + tax;

    const order = {
        id: this.generateOrderId(),
        orderNumber: this.generateOrderNumber(),
        items: cartItems,
        customer: customerInfo,
        shipping: { ...shippingInfo, cost: shipping },
        subtotal: subtotal,
        shippingCost: shipping,
        tax: tax,
        total: total,
        status: 'whatsapp_pending',
        createdAt: new Date().toISOString(),
        paymentMethod: 'whatsapp'
    };

    // Siparii kaydet
    const orders = this.loadOrders();
    orders.push(order);
    localStorage.setItem('emirTuningOrders', JSON.stringify(orders));

    return order;
}

// WhatsApp mesaj olutur
generateWhatsAppMessage(order) {
    const itemsText = order.items.map(item => 
        ` ${item.product.name} - ${item.quantity} adet - ${(item.product.price * item.quantity).toLocaleString()}`
    ).join('%0A');

    return `Merhaba! Yeni sipariim var:%0A%0A*Sipari No:* ${order.orderNumber}%0A*Toplam Tutar:* ${order.total.toLocaleString()}%0A%0A*Ürünler:*%0A${itemsText}%0A%0A*Müteri Bilgileri:*%0AAd Soyad: ${order.customer.name}%0ATelefon: ${order.customer.phone}%0AE-posta: ${order.customer.email}%0A%0A*Teslimat Adresi:*%0A${order.shipping.address}%0A${order.shipping.district}/${order.shipping.city}%0A%0ALütfen sipariimi onaylayn ve ödeme seçeneklerini bildirin.`;
}

// Güncellenmi banka bilgileri
getBankInfo() {
    return {
        bank: 'Ziraat Bankas',
        branch: 'Silivri-5006', 
        accountNumber: '319-61215686-5006',
        iban: 'TR80 0001 0003 1961 2156 8650 06',
        accountHolder: 'Gökmen Aydoan'
    };
}

// Havale/EFT mesaj olutur
generateBankTransferMessage(order) {
    const bankInfo = this.getBankInfo();
    return `Merhaba! Havale/EFT ile ödeme yapmak istiyorum.%0A%0A*Sipari No:* ${order.orderNumber}%0A*Tutar:* ${order.total.toLocaleString()}%0A%0A*Banka Bilgileriniz:*%0ABanka: ${bankInfo.bank}%0Aube: ${bankInfo.branch}%0AHesap No: ${bankInfo.accountNumber}%0AIBAN: ${bankInfo.iban}%0AHesap Sahibi: ${bankInfo.accountHolder}%0A%0AÖdeme yaptktan sonra dekontu buradan göndereceim.`;
}

// Güncellenmi banka bilgileri
getBankInfo() {
    return {
        bank: 'Ziraat Bankas',
        branch: 'Silivri-5006', 
        accountNumber: '319-61215686-5006',
        iban: 'TR80 0001 0003 1961 2156 8650 06',
        accountHolder: 'Gökmen Aydoan'
    };
}

// Havale/EFT mesaj olutur
generateBankTransferMessage(order) {
    const bankInfo = this.getBankInfo();
    return `Merhaba! Havale/EFT ile ödeme yapmak istiyorum.%0A%0A*Sipari No:* ${order.orderNumber}%0A*Tutar:* ${order.total.toLocaleString()}%0A%0A*Banka Bilgileriniz:*%0ABanka: ${bankInfo.bank}%0Aube: ${bankInfo.branch}%0AHesap No: ${bankInfo.accountNumber}%0AIBAN: ${bankInfo.iban}%0AHesap Sahibi: ${bankInfo.accountHolder}%0A%0AÖdeme yaptktan sonra dekontu buradan göndereceim.`;
}
