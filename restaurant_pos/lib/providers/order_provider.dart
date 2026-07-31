import 'package:flutter/foundation.dart';
import '../models/order.dart';
import '../services/socket_service.dart';

class OrderProvider with ChangeNotifier {
  final SocketService _socketService = SocketService();
  
  static bool isTesting = false;
  
  List<Order> _orders = [];
  bool _isSocketConnected = false;

  List<Order> get orders => _orders;
  bool get isSocketConnected => _isSocketConnected;

  // Group active orders by status for the Kanban board
  List<Order> get newOrders => _orders.where((o) => o.status == 'NEW').toList();
  List<Order> get cookingOrders => _orders.where((o) => o.status == 'COOKING').toList();
  List<Order> get readyOrDeliveredOrders => _orders.where((o) => o.status == 'READY' || o.status == 'DELIVERED').toList();

  void initSocket() {
    if (isTesting) return;
    _socketService.initialize(
      onConnectionStatusChanged: (connected) {
        _isSocketConnected = connected;
        notifyListeners();
      },
      onInitialOrdersReceived: (initialOrders) {
        // Sort orders by timestamp (newest first)
        _orders = initialOrders;
        _sortOrders();
        notifyListeners();
      },
      onNewOrderReceived: (newOrder) {
        // Avoid duplicates
        _orders.removeWhere((o) => o.id == newOrder.id);
        _orders.add(newOrder);
        _sortOrders();
        notifyListeners();
      },
      onOrderStatusChanged: (orderId, status) {
        final index = _orders.indexWhere((o) => o.id == orderId);
        if (index != -1) {
          if (status == 'PAID') {
            // Remove paid orders as the backend also splices them out from active memory
            _orders.removeAt(index);
          } else {
            _orders[index] = _orders[index].copyWith(status: status);
          }
          notifyListeners();
        }
      },
    );

    _socketService.connect();
  }

  void _sortOrders() {
    _orders.sort((a, b) {
      if (a.timestamp == null && b.timestamp == null) return 0;
      if (a.timestamp == null) return 1;
      if (b.timestamp == null) return -1;
      return b.timestamp!.compareTo(a.timestamp!); // Newest orders first
    });
  }

  /// Places a new order using the cart payload
  void placeOrder(Map<String, dynamic> orderPayload) {
    _socketService.emitNewOrder(orderPayload);
  }

  /// Updates an order status (e.g. from COOKING to DELIVERED, or DELIVERED to PAID)
  void updateOrderStatus(String orderId, String status) {
    _socketService.emitUpdateOrderStatus(orderId, status);
  }

  @override
  void dispose() {
    _socketService.disconnect();
    super.dispose();
  }
}
