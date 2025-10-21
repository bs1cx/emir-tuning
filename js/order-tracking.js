// Sipari Takip Sayfas Kontrolü
class OrderTracking {
    constructor() {
        this.currentOrder = null;
        this.notifications = [];
        this.init();
    }

    init() {
        this.attachEventListeners();
        this.loadDemoOrders();
        this.loadNotifications();
        this.checkUrlParameters();
    }

    attachEventListeners() {
        // Takip formu
        const trackingForm = document.getElementById('trackingForm');
        if (trackingForm) {
            trackingForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.trackOrder();
            });
        }

        // Enter tuu ile arama
        const orderInput = document.getElementById('orderNumber');
        if (orderInput) {
            orderInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.trackOrder();
                }
            });
        }

        // Sipari güncellemelerini dinle
        document.addEventListener('orderUpdated', (event) => {
            if (this.currentOrder && event.detail.order.orderNumber === this.currentOrder.orderNumber) {
                this.currentOrder = event.detail.order;
                this.renderOrderDetails();
                this.showNotification('Sipari durumu güncellendi!', 'info');
            }
        });

        // Bildirimleri dinle
        document.addEventListener('notificationReceived', (event) => {
            this.loadNotifications();
            this.showPushNotification(event.detail);
        });
    }

    checkUrlParameters() {
        const urlParams = new URLSearchParams(window.location.search);
        const orderNumber = urlParams.get('order');
        
        if (orderNumber) {
            document.getElementById('orderNumber').value = orderNumber;
            this.trackOrder(orderNumber);
        }
    }

    trackOrder(orderNumber = null) {
        const input = orderNumber || document.getElementById('orderNumber').value.trim().toUpperCase();
        
        if (!input) {
            this.showError('Lütfen bir sipari numaras girin.');
            return;
        }

        // Sipari format kontrolü
        if (!this.isValidOrderNumber(input)) {
            this.showError('Geçersiz sipari numaras format. Örnek: EMT12345678');
            return;
        }

        this.showLoading('Sipari aranyor...');

        // Siparii bul
        setTimeout(() => {
            const order = orderAPI.getOrder(input);
            
            if (order) {
                this.currentOrder = order;
                this.renderOrderDetails();
                this.hideLoading();
                
                // URL'yi güncelle
                const newUrl = `${window.location.pathname}?order=${input}`;
                window.history.pushState({}, '', newUrl);
            } else {
                this.hideLoading();
                this.showError('Sipari bulunamad. Lütfen sipari numaranz kontrol edin.');
            }
        }, 1000);
    }

    isValidOrderNumber(orderNumber) {
        return /^EMT[A-Z0-9]{8,12}$/.test(orderNumber);
    }

    renderOrderDetails() {
        const container = document.getElementById('orderDetails');
        if (!container || !this.currentOrder) return;

        container.style.display = 'block';
        container.innerHTML = this.createOrderDetailsHTML();

        // Sayfay kaydr
        container.scrollIntoView({ behavior: 'smooth' });

        // Canl güncelleme için abone ol
        this.subscribeToOrderUpdates();
    }

    createOrderDetailsHTML() {
        const order = this.currentOrder;
        const statusColor = orderAPI.getOrderStatusColor(order.status);
        const statusText = orderAPI.getOrderStatusText(order.status);

        return `
            <div class="order-card">
                <!-- Sipari Bal -->
                <div class="order-header">
                    <div class="order-info">
                        <h2>Sipari #${order.orderNumber}</h2>
                        <div class="order-meta">
                            <span class="order-date">
                                <i class="far fa-calendar"></i>
                                ${orderAPI.formatOrderDate(order.createdAt)}
                            </span>
                            <span class="order-status" style="color: ${statusColor}">
                                <i class="fas fa-circle"></i>
                                ${statusText}
                            </span>
                        </div>
                    </div>
                    <div class="order-actions">
                        <button class="btn btn--secondary" onclick="orderTracking.shareOrder()">
                            <i class="fas fa-share"></i> Payla
                        </button>
                        <button class="btn btn--outline" onclick="orderTracking.showNotifications()">
                            <i class="fas fa-bell"></i> Bildirimler
                            ${this.getUnreadNotificationCount() > 0 ? 
                                `<span class="notification-badge">${this.getUnreadNotificationCount()}</span>` : ''
                            }
                        </button>
                    </div>
                </div>

                <!-- Takip Çubuu -->
                <div class="tracking-timeline">
                    ${this.createTimelineHTML(order.tracking)}
                </div>

                <!-- Sipari çerii -->
                <div class="order-content">
                    <!-- Müteri Bilgileri -->
                    <div class="info-section">
                        <h4><i class="fas fa-user"></i> Müteri Bilgileri</h4>
                        <div class="info-grid">
                            <div class="info-item">
                                <label>Ad Soyad:</label>
                                <span>${order.customer.name}</span>
                            </div>
                            <div class="info-item">
                                <label>E-posta:</label>
                                <span>${order.customer.email}</span>
                            </div>
                            <div class="info-item">
                                <label>Telefon:</label>
                                <span>${order.customer.phone}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Teslimat Bilgileri -->
                    <div class="info-section">
                        <h4><i class="fas fa-truck"></i> Teslimat Bilgileri</h4>
                        <div class="info-grid">
                            <div class="info-item">
                                <label>Adres:</label>
                                <span>${order.shipping.address}</span>
                            </div>
                            <div class="info-item">
                                <label>ehir:</label>
                                <span>${order.shipping.city}</span>
                            </div>
                            <div class="info-item">
                                <label>Tahmini Teslimat:</label>
                                <span>${orderAPI.formatOrderDate(orderAPI.calculateEstimatedDelivery(order.createdAt))}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Sipari Özeti -->
                    <div class="info-section">
                        <h4><i class="fas fa-receipt"></i> Sipari Özeti</h4>
                        <div class="order-items">
                            ${order.items.map(item => `
                                <div class="order-item">
                                    <div class="item-image">${item.product.image}</div>
                                    <div class="item-details">
                                        <div class="item-name">${item.product.name}</div>
                                        <div class="item-meta">
                                            <span class="item-quantity">Adet: ${item.quantity}</span>
                                            <span class="item-price">${item.product.price.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <div class="item-total">
                                        ${(item.product.price * item.quantity).toLocaleString()}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        
                        <div class="order-totals">
                            <div class="total-row">
                                <span>Ara Toplam:</span>
                                <span>${order.total.toLocaleString()}</span>
                            </div>
                            <div class="total-row">
                                <span>Kargo:</span>
                                <span>${order.shipping.cost === 0 ? 'ÜCRETSZ' : `${order.shipping.cost.toLocaleString()}`}</span>
                            </div>
                            <div class="total-row grand-total">
                                <strong>Toplam:</strong>
                                <strong>${(order.total + order.shipping.cost).toLocaleString()}</strong>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Hzl lemler -->
                <div class="quick-actions">
                    <button class="btn btn--primary" onclick="orderTracking.contactSupport()">
                        <i class="fas fa-headset"></i> Müteri Hizmetleri
                    </button>
                    <button class="btn btn--secondary" onclick="orderTracking.downloadInvoice()">
                        <i class="fas fa-file-invoice"></i> Fatura ndir
                    </button>
                    <button class="btn btn--outline" onclick="orderTracking.printOrder()">
                        <i class="fas fa-print"></i> Yazdr
                    </button>
                </div>
            </div>
        `;
    }

    createTimelineHTML(trackingEvents) {
        return `
            <div class="timeline">
                ${trackingEvents.map((event, index) => `
                    <div class="timeline-item ${event.completed ? 'completed' : ''} ${index === 0 ? 'first' : ''} ${index === trackingEvents.length - 1 ? 'last' : ''}">
                        <div class="timeline-marker">
                            ${event.completed ? 
                                '<i class="fas fa-check-circle"></i>' : 
                                '<i class="far fa-circle"></i>'
                            }
                        </div>
                        <div class="timeline-content">
                            <div class="timeline-title">${event.title}</div>
                            <div class="timeline-description">${event.description}</div>
                            ${event.date ? `
                                <div class="timeline-date">
                                    <i class="far fa-clock"></i>
                                    ${orderAPI.formatOrderDate(event.date)}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    subscribeToOrderUpdates() {
        if (this.currentOrder) {
            this.unsubscribe = orderAPI.subscribeToOrderUpdates(
                this.currentOrder.orderNumber,
                (updatedOrder) => {
                    this.currentOrder = updatedOrder;
                    this.renderOrderDetails();
                }
            );
        }
    }

    // BLDRM SSTEM

    loadNotifications() {
        this.notifications = JSON.parse(localStorage.getItem('orderNotifications') || '[]');
    }

    getUnreadNotificationCount() {
        return this.notifications.filter(n => !n.read && n.orderNumber === this.currentOrder?.orderNumber).length;
    }

    showNotifications() {
        const modal = document.getElementById('notificationsModal');
        const list = document.getElementById('notificationsList');
        
        if (!modal || !list) return;

        const orderNotifications = this.notifications
            .filter(n => n.orderNumber === this.currentOrder?.orderNumber)
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        if (orderNotifications.length === 0) {
            list.innerHTML = '<div class="no-notifications">Henüz bildirim bulunmuyor</div>';
        } else {
            list.innerHTML = orderNotifications.map(notification => `
                <div class="notification-item ${notification.read ? 'read' : 'unread'}">
                    <div class="notification-icon">
                        <i class="fas fa-bell"></i>
                    </div>
                    <div class="notification-content">
                        <div class="notification-title">${notification.title}</div>
                        <div class="notification-message">${notification.message}</div>
                        <div class="notification-date">
                            ${orderAPI.formatOrderDate(notification.date)}
                        </div>
                    </div>
                    <div class="notification-actions">
                        ${!notification.read ? `
                            <button class="btn-mark-read" onclick="orderTracking.markAsRead(${notification.id})">
                                <i class="fas fa-check"></i>
                            </button>
                        ` : ''}
                    </div>
                </div>
            `).join('');
        }

        modal.style.display = 'block';
    }

    closeNotifications() {
        const modal = document.getElementById('notificationsModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    markAsRead(notificationId) {
        orderAPI.markNotificationAsRead(notificationId);
        this.loadNotifications();
        this.showNotifications();
        this.renderOrderDetails(); // Badge' güncelle
    }

    showPushNotification(notification) {
        if (this.currentOrder && notification.orderNumber === this.currentOrder.orderNumber) {
            Toastify({
                text: `${notification.title}: ${notification.message}`,
                duration: 5000,
                gravity: "top",
                position: "right",
                backgroundColor: "#4CAF50",
                onClick: () => {
                    this.showNotifications();
                }
            }).showToast();
        }
    }

    // DEMO VERLER

    loadDemoOrders() {
        // Demo siparileri olutur (eer yoksa)
        const existingOrders = orderAPI.orders;
        
        if (existingOrders.length === 0) {
            const demoOrders = [
                {
                    orderNumber: 'EMT2024123A',
                    customer: {
                        name: 'Ahmet Ylmaz',
                        email: 'ahmet@example.com',
                        phone: '+90 555 123 4567'
                    },
                    shipping: {
                        address: 'Atatürk Cad. No:123, Beikta',
                        city: 'stanbul',
                        cost: 0
                    },
                    items: [
                        {
                            product: dataManager.getProduct(1),
                            quantity: 1
                        },
                        {
                            product: dataManager.getProduct(2),
                            quantity: 1
                        }
                    ],
                    total: 1299 + 3499,
                    status: 'preparing'
                },
                {
                    orderNumber: 'EMT2024123B',
                    customer: {
                        name: 'Mehmet Demir',
                        email: 'mehmet@example.com',
                        phone: '+90 555 234 5678'
                    },
                    shipping: {
                        address: 'Badat Cad. No:456, Kadköy',
                        city: 'stanbul',
                        cost: 0
                    },
                    items: [
                        {
                            product: dataManager.getProduct(3),
                            quantity: 1
                        },
                        {
                            product: dataManager.getProduct(5),
                            quantity: 1
                        }
                    ],
                    total: 2499 + 1899,
                    status: 'shipped'
                },
                {
                    orderNumber: 'EMT2024123C',
                    customer: {
                        name: 'Aye Kaya',
                        email: 'ayse@example.com',
                        phone: '+90 555 345 6789'
                    },
                    shipping: {
                        address: 'stiklal Cad. No:789, Beyolu',
                        city: 'stanbul',
                        cost: 49.90
                    },
                    items: [
                        {
                            product: dataManager.getProduct(4),
                            quantity: 1
                        }
                    ],
                    total: 2199,
                    status: 'delivered'
                }
            ];

            demoOrders.forEach(orderData => {
                orderAPI.createOrder(orderData);
            });
        }
    }

    fillExample(orderNumber) {
        document.getElementById('orderNumber').value = orderNumber;
    }

    // YARDIMCI FONKSYONLAR

    showLoading(message = 'Yükleniyor...') {
        // Basit loading gösterme
        console.log(message);
    }

    hideLoading() {
        // Loading gizleme
    }

    showError(message) {
        Toastify({
            text: message,
            duration: 5000,
            gravity: "top",
            position: "right",
            backgroundColor: "#f44336"
        }).showToast();
    }

    showNotification(message, type = 'info') {
        Toastify({
            text: message,
            duration: 3000,
            gravity: "top",
            position: "right",
            backgroundColor: type === 'success' ? "#4CAF50" : 
                          type === 'error' ? "#f44336" : "#2196F3"
        }).showToast();
    }

    // EYLEMLER

    shareOrder() {
        if (this.currentOrder) {
            const shareText = `Sipariim #${this.currentOrder.orderNumber} - Emir Tuning Garage`;
            const shareUrl = `${window.location.origin}${window.location.pathname}?order=${this.currentOrder.orderNumber}`;
            
            if (navigator.share) {
                navigator.share({
                    title: 'Sipari Takip',
                    text: shareText,
                    url: shareUrl
                });
            } else {
                // Fallback: URL'yi kopyala
                navigator.clipboard.writeText(shareUrl).then(() => {
                    this.showNotification('Sipari linki panoya kopyaland!', 'success');
                });
            }
        }
    }

    contactSupport() {
        const phone = '905551234567';
        const message = `Merhaba, ${this.currentOrder?.orderNumber} numaral sipariim hakknda bilgi almak istiyorum.`;
        const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    }

    downloadInvoice() {
        this.showNotification('Fatura indirme özellii yaknda eklenecek!', 'info');
    }

    printOrder() {
        window.print();
    }
}

// Sayfa yüklendiinde balat
document.addEventListener('DOMContentLoaded', () => {
    window.orderTracking = new OrderTracking();
});

// Sayfadan ayrlrken cleanup
window.addEventListener('beforeunload', () => {
    if (orderTracking.unsubscribe) {
        orderTracking.unsubscribe();
    }
});
