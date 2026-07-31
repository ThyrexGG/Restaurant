import 'cart_item.dart';

class Order {
  final String id;
  final String? orderNumber;
  final String? dailyOrderNumber;
  final String table;
  final String type; // DINE_IN or TAKE_AWAY
  final String status; // NEW, COOKING, DELIVERED, PAID, CANCELLED
  final double total;
  final List<CartItem> items;
  final DateTime? timestamp;

  Order({
    required this.id,
    this.orderNumber,
    this.dailyOrderNumber,
    required this.table,
    required this.type,
    required this.status,
    required this.total,
    required this.items,
    this.timestamp,
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    var rawItems = json['items'] as List? ?? [];
    List<CartItem> parsedItems = rawItems.map((item) => CartItem.fromJson(item)).toList();

    DateTime? parsedTime;
    if (json['timestamp'] != null) {
      parsedTime = DateTime.tryParse(json['timestamp'].toString());
    }

    // Backend normalizes 'Table X' to 'X' for display, but let's handle whatever is returned
    String rawTable = json['table'] ?? '';
    if (rawTable.startsWith('Table ')) {
      rawTable = rawTable.substring(6);
    }

    return Order(
      id: json['id']?.toString() ?? '',
      orderNumber: json['orderNumber']?.toString(),
      dailyOrderNumber: json['dailyOrderNumber']?.toString(),
      table: rawTable.isEmpty ? 'Takeaway' : rawTable,
      type: json['type'] ?? 'DINE_IN',
      status: json['status'] ?? 'NEW',
      total: (json['total'] as num?)?.toDouble() ?? 0.0,
      items: parsedItems,
      timestamp: parsedTime,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'orderNumber': orderNumber,
      'dailyOrderNumber': dailyOrderNumber,
      'table': table,
      'type': type,
      'status': status,
      'total': total,
      'items': items.map((item) => item.toJson()).toList(),
      'timestamp': timestamp?.toIso8601String(),
    };
  }

  Order copyWith({
    String? id,
    String? orderNumber,
    String? dailyOrderNumber,
    String? table,
    String? type,
    String? status,
    double? total,
    List<CartItem>? items,
    DateTime? timestamp,
  }) {
    return Order(
      id: id ?? this.id,
      orderNumber: orderNumber ?? this.orderNumber,
      dailyOrderNumber: dailyOrderNumber ?? this.dailyOrderNumber,
      table: table ?? this.table,
      type: type ?? this.type,
      status: status ?? this.status,
      total: total ?? this.total,
      items: items ?? this.items,
      timestamp: timestamp ?? this.timestamp,
    );
  }
}
