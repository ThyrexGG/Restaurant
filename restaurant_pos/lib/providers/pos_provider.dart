import 'package:flutter/foundation.dart';
import '../models/menu_item.dart';
import '../services/api_service.dart';

class PosProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();

  // Navigation
  int _activeTabIndex = 0; // 0: POS Catalog, 1: Active Orders
  int get activeTabIndex => _activeTabIndex;

  void setActiveTab(int index) {
    _activeTabIndex = index;
    notifyListeners();
  }

  // Menu State
  List<MenuItem> _menuItems = [];
  bool _isLoading = false;
  String? _errorMessage;

  List<MenuItem> get menuItems => _menuItems;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  // Filters
  String _selectedCategory = 'All';
  String _searchQuery = '';

  String get selectedCategory => _selectedCategory;
  String get searchQuery => _searchQuery;

  void selectCategory(String category) {
    _selectedCategory = category;
    notifyListeners();
  }

  void updateSearchQuery(String query) {
    _searchQuery = query;
    notifyListeners();
  }

  // Get distinct list of categories from fetched items
  List<String> get categories {
    final Set<String> uniqueCategories = {'All'};
    for (var item in _menuItems) {
      if (item.category?.name != null && item.category!.name.isNotEmpty) {
        uniqueCategories.add(item.category!.name);
      } else if (item.categoryId.isNotEmpty) {
        // Fallback to ID if name is missing
        uniqueCategories.add(item.categoryId);
      }
    }
    return uniqueCategories.toList()..sort((a, b) {
      if (a == 'All') return -1;
      if (b == 'All') return 1;
      return a.compareTo(b);
    });
  }

  // Filtered menu items matching search query & category selection
  List<MenuItem> get filteredMenuItems {
    return _menuItems.where((item) {
      // 1. Category Filter
      final bool matchesCategory = _selectedCategory == 'All' ||
          (item.category?.name == _selectedCategory) ||
          (item.categoryId == _selectedCategory);

      // 2. Search Filter
      final bool matchesSearch = _searchQuery.isEmpty ||
          item.name.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          (item.sku != null && item.sku!.toLowerCase().contains(_searchQuery.toLowerCase())) ||
          (item.description != null && item.description!.toLowerCase().contains(_searchQuery.toLowerCase()));

      return matchesCategory && matchesSearch;
    }).toList();
  }

  Future<void> loadMenu() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _menuItems = await _apiService.fetchMenu();
      _isLoading = false;
    } catch (e) {
      _isLoading = false;
      _errorMessage = e.toString();
    }
    notifyListeners();
  }
}
