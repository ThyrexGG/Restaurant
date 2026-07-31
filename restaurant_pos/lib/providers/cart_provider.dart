import 'package:flutter/foundation.dart';
import '../models/cart_item.dart';
import '../models/menu_item.dart';

class CartProvider with ChangeNotifier {
  final Map<String, CartItem> _items = {};
  String _selectedTable = '1'; // Default table number, e.g. "1" or "2"
  String _orderType = 'DINE_IN'; // DINE_IN or TAKE_AWAY

  Map<String, CartItem> get items => {..._items};

  List<CartItem> get itemList => _items.values.toList();

  int get itemCount => _items.values.fold(0, (sum, item) => sum + item.quantity);

  double get totalAmount {
    return _items.values.fold(0.0, (sum, item) => sum + item.subtotal);
  }

  String get selectedTable => _selectedTable;
  String get orderType => _orderType;

  void setTable(String table) {
    _selectedTable = table;
    notifyListeners();
  }

  void setOrderType(String type) {
    _orderType = type;
    if (type == 'TAKE_AWAY') {
      _selectedTable = 'Takeaway';
    } else if (_selectedTable == 'Takeaway') {
      _selectedTable = '1'; // Reset to table 1 when toggling back to DINE_IN
    }
    notifyListeners();
  }

  void addItem(MenuItem menuItem) {
    if (_items.containsKey(menuItem.id)) {
      _items[menuItem.id]!.quantity += 1;
    } else {
      _items[menuItem.id] = CartItem.fromMenuItem(menuItem);
    }
    notifyListeners();
  }

  void updateQuantity(String itemId, int quantity) {
    if (!_items.containsKey(itemId)) return;
    
    if (quantity <= 0) {
      _items.remove(itemId);
    } else {
      _items[itemId]!.quantity = quantity;
    }
    notifyListeners();
  }

  void updateNotes(String itemId, String notes) {
    if (_items.containsKey(itemId)) {
      _items[itemId]!.notes = notes;
      notifyListeners();
    }
  }

  void removeItem(String itemId) {
    _items.remove(itemId);
    notifyListeners();
  }

  void clearCart() {
    _items.clear();
    _selectedTable = '1';
    _orderType = 'DINE_IN';
    notifyListeners();
  }

  /// Builds the exact JSON payload expected by the Socket.io backend on 'new_order' emit.
  Map<String, dynamic> buildOrderPayload() {
    return {
      'table': _orderType == 'TAKE_AWAY' ? 'Takeaway' : 'Table $_selectedTable',
      'type': _orderType,
      'items': itemList.map((item) => item.toJson()).toList(),
      'total': totalAmount,
    };
  }
}
