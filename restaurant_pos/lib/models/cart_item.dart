import 'menu_item.dart';

class CartItem {
  final String id;
  final String name;
  final double price;
  final String? sku;
  int quantity;
  String notes;

  CartItem({
    required this.id,
    required this.name,
    required this.price,
    this.sku,
    this.quantity = 1,
    this.notes = '',
  });

  factory CartItem.fromMenuItem(MenuItem menuItem, {int quantity = 1, String notes = ''}) {
    return CartItem(
      id: menuItem.id,
      name: menuItem.name,
      price: menuItem.price,
      sku: menuItem.sku,
      quantity: quantity,
      notes: notes,
    );
  }

  double get subtotal => price * quantity;

  factory CartItem.fromJson(Map<String, dynamic> json) {
    return CartItem(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      price: (json['price'] as num?)?.toDouble() ?? 0.0,
      sku: json['sku'],
      quantity: json['quantity'] ?? 1,
      notes: json['notes'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'price': price,
      'sku': sku ?? '',
      'quantity': quantity,
      'notes': notes,
    };
  }
}
