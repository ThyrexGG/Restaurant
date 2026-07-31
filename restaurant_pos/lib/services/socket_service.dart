import 'dart:developer' as developer;
import 'package:socket_io_client/socket_io_client.dart' as IO;
import '../models/order.dart';

class SocketService {
  static const String socketUrl = 'https://restaurant-pjwk.onrender.com';
  late IO.Socket _socket;
  bool _isConnected = false;
  bool _isInitialized = false;

  bool get isConnected => _isConnected;

  // Callbacks for notifying listeners
  void Function(bool connected)? onConnectionStatusChanged;
  void Function(List<Order> orders)? onInitialOrdersReceived;
  void Function(Order order)? onNewOrderReceived;
  void Function(String orderId, String status)? onOrderStatusChanged;

  void initialize({
    required void Function(bool connected) onConnectionStatusChanged,
    required void Function(List<Order> orders) onInitialOrdersReceived,
    required void Function(Order order) onNewOrderReceived,
    required void Function(String orderId, String status) onOrderStatusChanged,
  }) {
    this.onConnectionStatusChanged = onConnectionStatusChanged;
    this.onInitialOrdersReceived = onInitialOrdersReceived;
    this.onNewOrderReceived = onNewOrderReceived;
    this.onOrderStatusChanged = onOrderStatusChanged;

    developer.log('Initializing Socket.io client for URL: $socketUrl');

    _socket = IO.io(
      socketUrl,
      IO.OptionBuilder()
          .setTransports(['websocket']) // Use WebSocket transport only
          .disableAutoConnect()        // Connect manually
          .setReconnectionDelay(2000)  // Reconnection options
          .setReconnectionAttempts(99)
          .build(),
    );

    _isInitialized = true;
    _setupListeners();
  }

  void connect() {
    if (!_isInitialized) return;
    developer.log('Connecting to socket server...');
    _socket.connect();
  }

  void disconnect() {
    if (!_isInitialized) return;
    developer.log('Disconnecting from socket server...');
    _socket.disconnect();
  }

  void _setupListeners() {
    _socket.onConnect((_) {
      developer.log('Socket connected successfully.');
      _isConnected = true;
      onConnectionStatusChanged?.call(true);

      // Register as admin to receive cashier feed
      developer.log('Emitting join_admin...');
      _socket.emit('join_admin');
    });

    _socket.onDisconnect((_) {
      developer.log('Socket disconnected.');
      _isConnected = false;
      onConnectionStatusChanged?.call(false);
    });

    _socket.onConnectError((data) {
      developer.log('Socket Connection Error: $data');
      _isConnected = false;
      onConnectionStatusChanged?.call(false);
    });

    // Listeners for business events
    _socket.on('initial_orders', (data) {
      developer.log('Received initial_orders event.');
      try {
        if (data is List) {
          final orders = data.map((item) => Order.fromJson(item)).toList();
          onInitialOrdersReceived?.call(orders);
        } else {
          developer.log('Invalid format for initial_orders: $data');
        }
      } catch (e) {
        developer.log('Error parsing initial orders: $e');
      }
    });

    _socket.on('new_order_received', (data) {
      developer.log('Received new_order_received event.');
      try {
        if (data is Map<String, dynamic>) {
          final order = Order.fromJson(data);
          onNewOrderReceived?.call(order);
        } else {
          developer.log('Invalid format for new_order_received: $data');
        }
      } catch (e) {
        developer.log('Error parsing new order: $e');
      }
    });

    _socket.on('order_status_changed', (data) {
      developer.log('Received order_status_changed event.');
      try {
        if (data is Map) {
          final orderId = data['orderId']?.toString();
          final status = data['status']?.toString();
          if (orderId != null && status != null) {
            onOrderStatusChanged?.call(orderId, status);
          }
        }
      } catch (e) {
        developer.log('Error parsing order status changed: $e');
      }
    });
  }

  /// Emits a new order to the backend
  void emitNewOrder(Map<String, dynamic> orderPayload) {
    if (!_isInitialized) return;
    if (!_isConnected) {
      developer.log('Warning: Socket not connected. Cannot emit new_order.');
    }
    developer.log('Emitting new_order with payload: $orderPayload');
    _socket.emit('new_order', orderPayload);
  }

  /// Emits an order status change to the backend
  void emitUpdateOrderStatus(String orderId, String status) {
    if (!_isInitialized) return;
    if (!_isConnected) {
      developer.log('Warning: Socket not connected. Cannot emit update_order_status.');
    }
    developer.log('Emitting update_order_status: orderId=$orderId, status=$status');
    _socket.emit('update_order_status', {
      'orderId': orderId,
      'status': status,
    });
  }
}
