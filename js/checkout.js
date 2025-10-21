// Checkout Sayfas Kontrolü
class CheckoutPage {
    constructor() {
        this.orderData = null;
        this.customerInfo = {};
        this.shippingInfo = {};
        this.paymentMethod = 'whatsapp';
        this.bankInfo = {
            bank: 'Ziraat Bankas',
            branch: 'Silivri-5006',
            accountNumber: '319-61215686-5006',
            iban: 'TR80 0001 0003 1961 2156 8650 06',
            accountHolder: 'Gökmen Aydoan'
        };
        this.init();
    }

    init() {
        this.loadCartItems();
        this.calculateTotals();
        this.attachEventListeners();
        this.checkEmptyCart();
        this.updateBankInfo();
    }

    updateBankInfo() {
        // Banka bilgilerini DOM'a ekle
        const bankDetails = document.querySelector('.bank-details');
        if (bankDetails) {
            bankDetails.innerHTML = `
                <div class="bank-detail">
                    <label>Banka:</label>
                    <span>${this.bankInfo.bank}</span>
                </div>
                <div class="bank-detail">
                    <label>ube:</label>
                    <span>${this.bankInfo.branch}</span>
                </div>
                <div class="bank-detail">
                    <label>Hesap No:</label>
                    <span>${this.bankInfo.accountNumber}</span>
                </div>
                <div class="bank-detail">
                    <label>IBAN:</label>
                    <span>${this.bankInfo.iban}</span>
                </div>
                <div class="bank-detail">
                    <label>Hesap Sahibi:</label>
                    <span>${this.bankInfo.accountHolder}</span>
                </div>
            `;
        }
    }

    // ... (dier fonksiyonlar ayn kalacak)

    showBankTransferModal() {
        // Banka transferi için bilgileri göster
        const message = this.createBankTransferMessage();
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/905327788339?text=${encodedMessage}`;
        
        // Siparii kaydet
        const order = orderAPI.createOrder(this.orderData);
        
        // WhatsApp'a yönlendir
        window.open(whatsappUrl, '_blank');
        
        // Sepeti temizle
        cartManager.clearCart();
        
        this.showSuccess('Banka bilgileri WhatsApp\'a yönlendiriliyor!');
    }

    createBankTransferMessage() {
        return `Merhaba! Havale/EFT ile ödeme yapmak istiyorum.%0A%0A*Sipari No:* ${orderAPI.generateOrderNumber()}%0A*Tutar:* ${this.orderData.total.toLocaleString()}%0A%0A*Banka Bilgileriniz:*%0ABanka: ${this.bankInfo.bank}%0Aube: ${this.bankInfo.branch}%0AHesap No: ${this.bankInfo.accountNumber}%0AIBAN: ${this.bankInfo.iban}%0AHesap Sahibi: ${this.bankInfo.accountHolder}%0A%0AÖdeme yaptktan sonra dekontu buradan göndereceim.`;
    }

    createWhatsAppMessage(order) {
        const itemsText = order.items.map(item => 
            ` ${item.product.name} - ${item.quantity} adet - ${(item.product.price * item.quantity).toLocaleString()}`
        ).join('%0A');

        return `Merhaba! Yeni sipariim var:%0A%0A*Sipari No:* ${order.orderNumber}%0A*Toplam Tutar:* ${order.total.toLocaleString()}%0A%0A*Ürünler:*%0A${itemsText}%0A%0A*Müteri Bilgileri:*%0AAd Soyad: ${order.customer.name}%0ATelefon: ${order.customer.phone}%0AE-posta: ${order.customer.email}%0A%0A*Teslimat Adresi:*%0A${order.shipping.address}%0A${order.shipping.district}/${order.shipping.city}%0A%0ALütfen sipariimi onaylayn ve ödeme seçeneklerini bildirin.`;
    }

    // ... (dier fonksiyonlar ayn)
}

// Sayfa yüklendiinde balat
document.addEventListener('DOMContentLoaded', () => {
    window.checkoutPage = new CheckoutPage();
});

// Modal dna tklaynca kapat
window.addEventListener('click', (event) => {
    const modal = document.getElementById('whatsappModal');
    if (event.target === modal) {
        checkoutPage.closeWhatsAppModal();
    }
});

// ESC tuu ile modal kapatma
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        checkoutPage.closeWhatsAppModal();
    }
});
