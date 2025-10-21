// Sipari Takip API Benzeri Sistem
class OrderAPI {
    constructor() {
        this.baseURL = this.getBaseURL();
        this.orders = this.loadOrders();
        this.init();
    }

    init() {
        console.log('Order API initialized');
    }

    getBaseURL() {
        // Gerçek bir API URL'si olacak, imdilik localStorage kullanyoruz
        return window.location.origin;
    }

    // SPAR YÖNETM

    loadOrders() {
        const savedOrders = localStorage.getItem('emirTuningOrders');
        return savedOrders ? JSON.parse(savedOrders) : [];
    }

    saveOrders() {
        localStorage.setItem('emirTuningOrders', JSON.stringify(this.orders));
    }

    createOrder(orderData) {
        const order = {
            id: this.generateOrderId(),
            orderNumber: this.generateOrderNumber(),
            ...orderData,
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            tracking: this.generateTrackingEvents('pending')
        };

        this.orders.push(order);
        this.saveOrders();
        
        // Sipari oluturuldu event'i
        this.dispatchOrderEvent('orderCreated', order);
        
        return order;
    }

    getOrder(orderNumber) {
        return this.orders.find(order => order.orderNumber === orderNumber);
    }

    getOrdersByCustomer(customerEmail) {
        return this.orders.filter(order => 
            order.customer.email === customerEmail
        ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    updateOrderStatus(orderNumber, newStatus, notes = '') {
        const order = this.getOrder(orderNumber);
        if (order) {
            order.status = newStatus;
            order.updatedAt = new Date().toISOString();
            order.tracking = this.generateTrackingEvents(newStatus, order.tracking);
            
            if (notes) {
                order.notes = order.notes || [];
                order.notes.push({
                    text: notes,
                    date: new Date().toISOString(),
                    type: 'status_update'
                });
            }

            this.saveOrders();
            this.dispatchOrderEvent('orderUpdated', order);
            return order;
        }
        return null;
    }

    // SPAR TAKP SSTEM

    generateTrackingEvents(status, existingEvents = []) {
        const events = [...existingEvents];
        const now = new Date().toISOString();

        const statusEvents = {
            'pending': { title: 'Sipari Alnd', description: 'Sipariiniz baaryla oluturuldu.' },
            'confirmed': { title: 'Sipari Onayland', description: 'Sipariiniz onayland ve hazrlanyor.' },
            'preparing': { title: 'Hazrlanyor', description: 'Ürünleriniz hazrlanyor.' },
            'ready': { title: 'Hazr', description: 'Sipariiniz hazrland.' },
            'shipped': { title: 'Kargoya Verildi', description: 'Sipariiniz kargoya verildi.' },
            'delivered': { title: 'Teslim Edildi', description: 'Sipariiniz teslim edildi.' },
            'cancelled': { title: 'ptal Edildi', description: 'Sipariiniz iptal edildi.' }
        };

        if (statusEvents[status] && !events.some(e => e.status === status)) {
            events.push({
                status: status,
                title: statusEvents[status].title,
                description: statusEvents[status].description,
                date: now,
                completed: true
            });
        }

        // Gelecek aamalar ekle
        const allStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'shipped', 'delivered'];
        const currentIndex = allStatuses.indexOf(status);
        
        allStatuses.forEach((futureStatus, index) => {
            if (index > currentIndex && !events.some(e => e.status === futureStatus)) {
                events.push({
                    status: futureStatus,
                    title: statusEvents[futureStatus].title,
                    description: statusEvents[futureStatus].description,
                    date: null,
                    completed: false
                });
            }
        });

        return events.sort((a, b) => {
            const order = ['pending', 'confirmed', 'preparing', 'ready', 'shipped', 'delivered', 'cancelled'];
            return order.indexOf(a.status) - order.indexOf(b.status);
        });
    }

    getTrackingInfo(orderNumber) {
        const order = this.getOrder(orderNumber);
        if (!order) return null;

        return {
            orderNumber: order.orderNumber,
            status: order.status,
            events: order.tracking,
            customer: order.customer,
            items: order.items,
            total: order.total,
            shipping: order.shipping,
            estimatedDelivery: this.calculateEstimatedDelivery(order.createdAt)
        };
    }

    calculateEstimatedDelivery(createdAt) {
        const created = new Date(createdAt);
        const estimated = new Date(created);
        estimated.setDate(estimated.getDate() + 3); // 3 i günü
        return estimated.toISOString();
    }

    // BLDRM SSTEM

    dispatchOrderEvent(eventType, order) {
        const event = new CustomEvent(eventType, {
            detail: { order }
        });
        document.dispatchEvent(event);
    }

    subscribeToOrderUpdates(orderNumber, callback) {
        const handler = (event) => {
            if (event.detail.order.orderNumber === orderNumber) {
                callback(event.detail.order);
            }
        };
        
        document.addEventListener('orderUpdated', handler);
        return () => document.removeEventListener('orderUpdated', handler);
    }

    // YARDIMCI FONKSYONLAR

    generateOrderId() {
        return 'ORD_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    generateOrderNumber() {
        const timestamp = Date.now().toString().slice(-8);
        const random = Math.random().toString(36).substr(2, 4).toUpperCase();
        return `EMT${timestamp}${random}`;
    }

    formatOrderDate(dateString) {
        return new Date(dateString).toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    getOrderStatusColor(status) {
        const colors = {
            'pending': '#ff9800',
            'confirmed': '#2196f3',
            'preparing': '#673ab7',
            'ready': '#009688',
            'shipped': '#4caf50',
            'delivered': '#2e7d32',
            'cancelled': '#f44336'
        };
        return colors[status] || '#666';
    }

    getOrderStatusText(status) {
        const texts = {
            'pending': 'Beklemede',
            'confirmed': 'Onayland',
            'preparing': 'Hazrlanyor',
            'ready': 'Hazr',
            'shipped': 'Kargoda',
            'delivered': 'Teslim Edildi',
            'cancelled': 'ptal Edildi'
        };
        return texts[status] || status;
    }

    // RAPORLAMA VE ANALTK

    getOrderStats() {
        const totalOrders = this.orders.length;
        const pendingOrders = this.orders.filter(o => o.status === 'pending').length;
        const deliveredOrders = this.orders.filter(o => o.status === 'delivered').length;
        const totalRevenue = this.orders
            .filter(o => o.status !== 'cancelled')
            .reduce((sum, order) => sum + order.total, 0);

        return {
            totalOrders,
            pendingOrders,
            deliveredOrders,
            totalRevenue,
            averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
        };
    }

    // MOBILE APP BENZER ÖZELLKLER

    // Push Notification benzeri sistem
    sendNotification(order, type) {
        const notifications = JSON.parse(localStorage.getItem('orderNotifications') || '[]');
        
        const notification = {
            id: Date.now(),
            orderNumber: order.orderNumber,
            type: type,
            title: this.getNotificationTitle(type, order),
            message: this.getNotificationMessage(type, order),
            date: new Date().toISOString(),
            read: false
        };

        notifications.unshift(notification);
        localStorage.setItem('orderNotifications', JSON.stringify(notifications.slice(0, 50))); // Son 50 bildirim

        // Bildirim event'i
        this.dispatchOrderEvent('notificationReceived', notification);
    }

    getNotificationTitle(type, order) {
        const titles = {
            'order_created': 'Sipariiniz Alnd',
            'status_updated': 'Sipari Durumu Güncellendi',
            'order_shipped': 'Sipariiniz Kargoda',
            'order_delivered': 'Sipariiniz Teslim Edildi'
        };
        return titles[type] || 'Sipari Bildirimi';
    }

    getNotificationMessage(type, order) {
        const messages = {
            'order_created': `${order.orderNumber} numaral sipariiniz alnd.`,
            'status_updated': `${order.orderNumber} sipariinizin durumu: ${this.getOrderStatusText(order.status)}`,
            'order_shipped': `${order.orderNumber} sipariiniz kargoya verildi.`,
            'order_delivered': `${order.orderNumber} sipariiniz teslim edildi.`
        };
        return messages[type] || 'Sipariinizle ilgili güncelleme var.';
    }

    getUnreadNotifications() {
        const notifications = JSON.parse(localStorage.getItem('orderNotifications') || '[]');
        return notifications.filter(notification => !notification.read);
    }

    markNotificationAsRead(notificationId) {
        const notifications = JSON.parse(localStorage.getItem('orderNotifications') || '[]');
        const notification = notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
            localStorage.setItem('orderNotifications', JSON.stringify(notifications));
        }
    }
}

// Global instance
const orderAPI = new OrderAPI();

// Admin için otomatik sipari durumu güncelleme (simülasyon)
function simulateOrderProgress() {
    setInterval(() => {
        const pendingOrders = orderAPI.orders.filter(order => 
            order.status !== 'delivered' && order.status !== 'cancelled'
        );

        pendingOrders.forEach(order => {
            const statusOrder = ['pending', 'confirmed', 'preparing', 'ready', 'shipped', 'delivered'];
            const currentIndex = statusOrder.indexOf(order.status);
            
            if (currentIndex < statusOrder.length - 1) {
                // Rastgele sürelerde ilerleme (demo için)
                if (Math.random() < 0.1) { // %10 ans
                    const nextStatus = statusOrder[currentIndex + 1];
                    orderAPI.updateOrderStatus(order.orderNumber, nextStatus, 'Otomatik sistem güncellemesi');
                    
                    // Bildirim gönder
                    orderAPI.sendNotification(order, 'status_updated');
                }
            }
        });
    }, 30000); // 30 saniyede bir kontrol
}

// Demo için otomatik ilerlemeyi balat
// simulateOrderProgress();
