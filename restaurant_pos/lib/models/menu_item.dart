class Category {
  final String id;
  final String name;
  final String? image;

  Category({
    required this.id,
    required this.name,
    this.image,
  });

  factory Category.fromJson(Map<String, dynamic> json) {
    return Category(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      image: json['image'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'image': image,
    };
  }
}

class MenuItem {
  final String id;
  final String? sku;
  final String name;
  final String? description;
  final double price;
  final String? image;
  final String categoryId;
  final Category? category;

  MenuItem({
    required this.id,
    this.sku,
    required this.name,
    this.description,
    required this.price,
    this.image,
    required this.categoryId,
    this.category,
  });

  factory MenuItem.fromJson(Map<String, dynamic> json) {
    return MenuItem(
      id: json['id'] ?? '',
      sku: json['sku'],
      name: json['name'] ?? '',
      description: json['description'],
      price: (json['price'] as num?)?.toDouble() ?? 0.0,
      image: json['image'],
      categoryId: json['categoryId'] ?? '',
      category: json['category'] != null ? Category.fromJson(json['category']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'sku': sku,
      'name': name,
      'description': description,
      'price': price,
      'image': image,
      'categoryId': categoryId,
      'category': category?.toJson(),
    };
  }
}
