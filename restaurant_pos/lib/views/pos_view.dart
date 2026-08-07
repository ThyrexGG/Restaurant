import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/pos_provider.dart';
import '../providers/cart_provider.dart';
import '../providers/order_provider.dart';
import '../models/menu_item.dart';
import '../models/cart_item.dart';
import '../theme/app_theme.dart';
import '../services/api_service.dart';

class PosView extends StatelessWidget {
  const PosView({super.key});

  @override
  Widget build(BuildContext context) {
    final posProvider = Provider.of<PosProvider>(context);
    final double width = MediaQuery.of(context).size.width;
    final double height = MediaQuery.of(context).size.height;
    // Split screen on tablets/desktops (width > 720 and height > 550) to exclude landscape phones
    final bool showSplitScreen = width > 720 && height > 550;

    if (posProvider.isLoading && posProvider.menuItems.isEmpty) {
      return const Center(
        child: CircularProgressIndicator(color: AppTheme.primaryAccent),
      );
    }

    if (posProvider.errorMessage != null && posProvider.menuItems.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline_rounded, size: 64, color: AppTheme.statusCancelled),
            const SizedBox(height: 16),
            Text('Failed to load menu items', style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 8),
            Text(posProvider.errorMessage!, style: Theme.of(context).textTheme.bodyMedium),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: () => posProvider.loadMenu(),
              icon: const Icon(Icons.replay_rounded),
              label: const Text('Try Again'),
            ),
          ],
        ),
      );
    }

    return Scaffold(
      body: Row(
        children: [
          // Left Pane: Menu Catalog
          Expanded(
            flex: 3,
            child: _buildCatalogPane(context, posProvider),
          ),
          
          // Right Pane: Cart Sidebar (only on desktop/large screens)
          if (showSplitScreen)
            Container(
              width: 380,
              decoration: const BoxDecoration(
                border: Border(left: BorderSide(color: AppTheme.cardBorder, width: 1.5)),
                color: AppTheme.cardBg,
              ),
              child: const CartPane(),
            ),
        ],
      ),
      // Floating cart button for smaller screens
      floatingActionButton: !showSplitScreen
          ? Consumer<CartProvider>(
              builder: (context, cartProvider, child) {
                if (cartProvider.itemCount == 0) return const SizedBox.shrink();
                return SafeArea(
                  child: FloatingActionButton.extended(
                    onPressed: () => _showCartDrawer(context),
                    backgroundColor: AppTheme.primaryAccent,
                    icon: const Badge(
                      label: Text(''),
                      child: Icon(Icons.shopping_cart_rounded, color: Colors.white),
                    ),
                    label: Text('View Order (\$${cartProvider.totalAmount.toStringAsFixed(2)})'),
                  ),
                );
              },
            )
          : null,
    );
  }

  Widget _buildCatalogPane(BuildContext context, PosProvider posProvider) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Search & Category Filter Section
        Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            children: [
              // Search Text Field
              TextField(
                onChanged: posProvider.updateSearchQuery,
                decoration: InputDecoration(
                  hintText: 'Search by item name, SKU, or description...',
                  prefixIcon: const Icon(Icons.search_rounded, color: AppTheme.textSecondary),
                  suffixIcon: posProvider.searchQuery.isNotEmpty
                      ? IconButton(
                          icon: const Icon(Icons.clear_rounded, color: AppTheme.textSecondary),
                          onPressed: () {
                            posProvider.updateSearchQuery('');
                          },
                        )
                      : null,
                ),
              ),
              const SizedBox(height: 16),
              
              // Category Buttons
              SizedBox(
                height: 44,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  itemCount: posProvider.categories.length,
                  itemBuilder: (context, index) {
                    final category = posProvider.categories[index];
                    final isSelected = posProvider.selectedCategory == category;
                    return Padding(
                      padding: const EdgeInsets.only(right: 8.0),
                      child: ChoiceChip(
                        label: Text(category),
                        selected: isSelected,
                        onSelected: (_) => posProvider.selectCategory(category),
                        selectedColor: AppTheme.primaryAccent.withOpacity(0.2),
                        backgroundColor: Colors.transparent,
                        checkmarkColor: AppTheme.primaryAccent,
                        side: BorderSide(
                          color: isSelected ? AppTheme.primaryAccent : AppTheme.cardBorder,
                          width: 1.5,
                        ),
                        labelStyle: TextStyle(
                          color: isSelected ? AppTheme.textPrimary : AppTheme.textSecondary,
                          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        ),

        // Grid View of Menu Items
        Expanded(
          child: posProvider.filteredMenuItems.isEmpty
              ? const Center(
                  child: Text(
                    'No menu items match your search/filter.',
                    style: TextStyle(color: AppTheme.textSecondary, fontSize: 15),
                  ),
                )
              : Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16.0),
                  child: GridView.builder(
                    gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
                      maxCrossAxisExtent: 220,
                      childAspectRatio: 0.8,
                      mainAxisSpacing: 16,
                      crossAxisSpacing: 16,
                    ),
                    itemCount: posProvider.filteredMenuItems.length,
                    itemBuilder: (context, index) {
                      final item = posProvider.filteredMenuItems[index];
                      return MenuItemCard(item: item);
                    },
                  ),
                ),
        ),
      ],
    );
  }

  // Opens cart as a slide-up bottom drawer on compact displays
  void _showCartDrawer(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppTheme.darkBg,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
        return SafeArea(
          top: false, // Let the sheet stretch up to 85% height, but pad bottom content safely
          child: FractionallySizedBox(
            heightFactor: 0.85,
            child: Column(
              children: [
                const SizedBox(height: 12),
                Container(
                  width: 40,
                  height: 5,
                  decoration: BoxDecoration(
                    color: AppTheme.cardBorder,
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
                const Expanded(
                  child: CartPane(),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

class MenuItemCard extends StatelessWidget {
  final MenuItem item;

  const MenuItemCard({super.key, required this.item});

  String _getFullImageUrl(String? imgPath) {
    if (imgPath == null || imgPath.isEmpty) return '';
    if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) {
      return imgPath;
    }
    final clean = imgPath.startsWith('/') ? imgPath : '/$imgPath';
    return '${ApiService.imageBaseUrl}$clean';
  }

  @override
  Widget build(BuildContext context) {
    final cartProvider = Provider.of<CartProvider>(context, listen: false);
    final imageUrl = _getFullImageUrl(item.image);
    final double width = MediaQuery.of(context).size.width;
    final double height = MediaQuery.of(context).size.height;
    // Split screen on tablets/desktops (width > 720 and height > 550) to exclude landscape phones
    final bool showSplitScreen = width > 720 && height > 550;

    return InkWell(
      onTap: () {
        if (_itemNeedsOptions(item)) {
          _showItemOptionsDialog(context, item, cartProvider, showSplitScreen);
        } else {
          cartProvider.addItem(item);
          if (!showSplitScreen) {
            _showGlassmorphicToast(context, item.name);
          }
        }
      },
      borderRadius: BorderRadius.circular(16),
      child: Container(
        decoration: AppTheme.glassBoxDecoration(),
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Menu Image
            Expanded(
              child: imageUrl.isNotEmpty
                  ? Image.network(
                      imageUrl,
                      fit: BoxFit.cover,
                      cacheWidth: 400, // Optimize memory usage by decoding at max 400px width
                      errorBuilder: (context, error, stackTrace) => _buildFallbackImage(),
                      loadingBuilder: (context, child, loadingProgress) {
                        if (loadingProgress == null) return child;
                        return Container(
                          color: AppTheme.cardBg,
                          child: const Center(
                            child: SizedBox(
                              width: 24,
                              height: 24,
                              child: CircularProgressIndicator(strokeWidth: 2, color: AppTheme.primaryAccent),
                            ),
                          ),
                        );
                      },
                    )
                  : _buildFallbackImage(),
            ),

            // Item metadata
            Padding(
              padding: const EdgeInsets.all(12.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  SizedBox(
                    height: 40,
                    child: Text(
                      item.name,
                      style: const TextStyle(
                        color: AppTheme.textPrimary,
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        item.sku != null && item.sku!.isNotEmpty ? 'SKU: ${item.sku}' : 'No SKU',
                        style: const TextStyle(
                          color: AppTheme.textSecondary,
                          fontSize: 11,
                        ),
                      ),
                      Text(
                        '\$${item.price.toStringAsFixed(2)}',
                        style: const TextStyle(
                          color: AppTheme.statusDelivered,
                          fontWeight: FontWeight.bold,
                          fontSize: 14,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFallbackImage() {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [AppTheme.cardBg, AppTheme.cardBorder],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: const Center(
        child: Icon(
          Icons.restaurant_rounded,
          color: AppTheme.textSecondary,
          size: 40,
        ),
      ),
    );
  }
}

class CartPane extends StatefulWidget {
  const CartPane({super.key});

  @override
  State<CartPane> createState() => _CartPaneState();
}

class _CartPaneState extends State<CartPane> {
  final List<String> _tables = List.generate(20, (i) => '${i + 1}');

  @override
  Widget build(BuildContext context) {
    final cartProvider = Provider.of<CartProvider>(context);
    final orderProvider = Provider.of<OrderProvider>(context, listen: false);

    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Cart Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Current Checkout',
                style: TextStyle(
                  color: AppTheme.textPrimary,
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              if (cartProvider.itemList.isNotEmpty)
                TextButton.icon(
                  onPressed: () => cartProvider.clearCart(),
                  icon: const Icon(Icons.delete_sweep_rounded, color: AppTheme.statusCancelled, size: 18),
                  label: const Text('Clear', style: TextStyle(color: AppTheme.statusCancelled)),
                )
            ],
          ),
          const SizedBox(height: 12),

          // Dine in vs Takeaway Toggle
          Row(
            children: [
              Expanded(
                child: ChoiceChip(
                  label: const Center(child: Text('DINE IN')),
                  selected: cartProvider.orderType == 'DINE_IN',
                  onSelected: (selected) {
                    if (selected) cartProvider.setOrderType('DINE_IN');
                  },
                  selectedColor: AppTheme.primaryAccent,
                  backgroundColor: AppTheme.cardBg,
                  labelStyle: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: ChoiceChip(
                  label: const Center(child: Text('TAKE OUT')),
                  selected: cartProvider.orderType == 'TAKE_AWAY',
                  onSelected: (selected) {
                    if (selected) cartProvider.setOrderType('TAKE_AWAY');
                  },
                  selectedColor: AppTheme.primaryAccent,
                  backgroundColor: AppTheme.cardBg,
                  labelStyle: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Table Number selection dropdown (Dine-in only)
          if (cartProvider.orderType == 'DINE_IN')
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Select Table:', style: TextStyle(color: AppTheme.textPrimary, fontWeight: FontWeight.w500)),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppTheme.cardBorder, width: 1.5),
                  ),
                  child: DropdownButton<String>(
                    value: cartProvider.selectedTable == 'Takeaway' ? '1' : cartProvider.selectedTable,
                    dropdownColor: AppTheme.cardBg,
                    underline: const SizedBox.shrink(),
                    onChanged: (String? val) {
                      if (val != null) cartProvider.setTable(val);
                    },
                    items: _tables.map<DropdownMenuItem<String>>((String value) {
                      return DropdownMenuItem<String>(
                        value: value,
                        child: Text('Table $value', style: const TextStyle(color: AppTheme.textPrimary)),
                      );
                    }).toList(),
                  ),
                ),
              ],
            )
          else
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppTheme.primaryAccent.withOpacity(0.05),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppTheme.primaryAccent.withOpacity(0.2), width: 1.5),
              ),
              child: const Row(
                children: [
                  Icon(Icons.takeout_dining_rounded, color: AppTheme.primaryAccent, size: 20),
                  SizedBox(width: 8),
                  Text('Takeaway Mode Activated', style: TextStyle(color: AppTheme.primaryAccent, fontWeight: FontWeight.bold, fontSize: 13)),
                ],
              ),
            ),

          const Divider(),

          // Cart Items List
          Expanded(
            child: cartProvider.itemList.isEmpty
                ? const Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.shopping_basket_rounded, size: 64, color: AppTheme.cardBorder),
                        SizedBox(height: 12),
                        Text('Order cart is empty.', style: TextStyle(color: AppTheme.textSecondary)),
                      ],
                    ),
                  )
                : ListView.separated(
                    itemCount: cartProvider.itemList.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 10),
                    itemBuilder: (context, idx) {
                      final item = cartProvider.itemList[idx];
                      return _buildCartItemTile(context, item, cartProvider);
                    },
                  ),
          ),

          const Divider(),

          // Bill Summary
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 8.0),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Subtotal', style: TextStyle(color: AppTheme.textSecondary)),
                    Text('\$${cartProvider.totalAmount.toStringAsFixed(2)}', style: const TextStyle(color: AppTheme.textPrimary)),
                  ],
                ),
                const SizedBox(height: 6),
                const Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Tax (Included)', style: TextStyle(color: AppTheme.textSecondary)),
                    Text('\$0.00', style: TextStyle(color: AppTheme.textPrimary)),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Total Amount', style: TextStyle(color: AppTheme.textPrimary, fontWeight: FontWeight.bold, fontSize: 16)),
                    Text(
                      '\$${cartProvider.totalAmount.toStringAsFixed(2)}',
                      style: const TextStyle(color: AppTheme.statusDelivered, fontWeight: FontWeight.bold, fontSize: 18),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // Send to Kitchen Button
          const SizedBox(height: 8),
          ElevatedButton(
            onPressed: cartProvider.itemList.isEmpty
                ? null
                : () {
                    final payload = cartProvider.buildOrderPayload();
                    orderProvider.placeOrder(payload);

                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Order submitted for Table ${cartProvider.selectedTable}!'),
                        backgroundColor: AppTheme.statusDelivered,
                      ),
                    );

                    // Clear cart
                    cartProvider.clearCart();

                    // If compact sheet is showing, pop it
                    if (Navigator.canPop(context)) {
                      Navigator.pop(context);
                    }
                  },
            child: const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.send_rounded, size: 18),
                SizedBox(width: 8),
                Text('SEND TO KITCHEN'),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCartItemTile(BuildContext context, CartItem item, CartProvider cartProvider) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppTheme.darkBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.cardBorder, width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Item Name and Details
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      item.name,
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'Unit: \$${item.price.toStringAsFixed(2)} | SKU: ${item.sku ?? "N/A"}',
                      style: const TextStyle(color: AppTheme.textSecondary, fontSize: 11),
                    ),
                  ],
                ),
              ),

              // Item Subtotal Price
              Text(
                '\$${item.subtotal.toStringAsFixed(2)}',
                style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.textPrimary, fontSize: 14),
              ),
            ],
          ),
          const SizedBox(height: 8),

          // Adjust Quantity & Note Field Row
          Row(
            children: [
              // Quantity buttons
              Container(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: AppTheme.cardBorder),
                ),
                child: Row(
                  children: [
                    IconButton(
                      icon: const Icon(Icons.remove, size: 14, color: AppTheme.textPrimary),
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(minWidth: 28, minHeight: 28),
                      onPressed: () => cartProvider.updateQuantity(item.id, item.quantity - 1),
                    ),
                    Text('${item.quantity}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                    IconButton(
                      icon: const Icon(Icons.add, size: 14, color: AppTheme.textPrimary),
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(minWidth: 28, minHeight: 28),
                      onPressed: () => cartProvider.updateQuantity(item.id, item.quantity + 1),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              
              // Notes field trigger
              Expanded(
                child: TextField(
                  onChanged: (val) => cartProvider.updateNotes(item.id, val),
                  decoration: const InputDecoration(
                    hintText: 'Add special request notes...',
                    hintStyle: TextStyle(fontSize: 11, color: AppTheme.textSecondary),
                    filled: true,
                    fillColor: Colors.transparent,
                    border: InputBorder.none,
                    enabledBorder: InputBorder.none,
                    focusedBorder: UnderlineInputBorder(borderSide: BorderSide(color: AppTheme.primaryAccent)),
                    contentPadding: EdgeInsets.symmetric(vertical: 4),
                  ),
                  controller: TextEditingController(text: item.notes)..selection = TextSelection.fromPosition(TextPosition(offset: item.notes.length)),
                  style: const TextStyle(fontSize: 12, color: AppTheme.textPrimary),
                ),
              ),

              // Delete button
              IconButton(
                icon: const Icon(Icons.delete_outline_rounded, color: AppTheme.statusCancelled, size: 20),
                onPressed: () => cartProvider.removeItem(item.id),
              )
            ],
          ),
        ],
      ),
    );
  }
}

// Check if item needs options (meat selections, drinks customizations, fried egg add-on)
bool _itemNeedsOptions(MenuItem item) {
  final nameLower = item.name.toLowerCase();
  final catLower = (item.category?.name ?? '').toLowerCase();

  // 1. Check for parentheses options like (Chicken/Fish/Tofu)
  final optionsMatch = RegExp(r'\(([^)]+)\)').firstMatch(item.name);
  if (optionsMatch != null && optionsMatch.group(1)!.contains('/')) {
    return true;
  }

  // 2. Check if it's a drink
  final isDrink = catLower.contains('drink') ||
      catLower.contains('beverage') ||
      catLower.contains('smoothie') ||
      catLower.contains('juice') ||
      catLower.contains('macchiato') ||
      catLower.contains('coffee') ||
      catLower.contains('tea') ||
      catLower.contains('cocktail') ||
      catLower.contains('iced') ||
      nameLower.contains('smoothie') ||
      nameLower.contains('juice') ||
      nameLower.contains('tea') ||
      nameLower.contains('coffee') ||
      nameLower.contains('macchiato') ||
      nameLower.contains('soda') ||
      nameLower.contains('frappe') ||
      nameLower.contains('shake') ||
      nameLower.contains('drink') ||
      nameLower.contains('latte');

  if (isDrink) return true;

  // 3. Check if eligible for Fried Egg
  final isEligibleForEgg = (nameLower.contains('fried rice') ||
          nameLower.contains('fried noodle') ||
          nameLower.contains('stir fried') ||
          catLower.contains('fried rice') ||
          catLower.contains('fried noodle')) &&
      !nameLower.contains('burger') &&
      !nameLower.contains('soup') &&
      !catLower.contains('burger') &&
      !catLower.contains('soup');

  if (isEligibleForEgg) return true;

  return false;
}

// Show Custom Options Dialog (Meat choice, Sugar, Ice, Fried egg)
void _showItemOptionsDialog(BuildContext context, MenuItem item, CartProvider cartProvider, bool showSplitScreen) {
  final nameLower = item.name.toLowerCase();
  final catLower = (item.category?.name ?? '').toLowerCase();

  // Parse options e.g. "Amok (Chicken/Fish)"
  final optionsMatch = RegExp(r'\(([^)]+)\)').firstMatch(item.name);
  List<String> options = [];
  String baseName = item.name;
  if (optionsMatch != null && optionsMatch.group(1)!.contains('/')) {
    options = optionsMatch.group(1)!.split('/').map((s) => s.trim()).toList();
    baseName = item.name.replaceAll(RegExp(r'\([^)]+\)'), '').trim();
  }

  final isDrink = catLower.contains('drink') ||
      catLower.contains('beverage') ||
      catLower.contains('smoothie') ||
      catLower.contains('juice') ||
      catLower.contains('macchiato') ||
      catLower.contains('coffee') ||
      catLower.contains('tea') ||
      catLower.contains('cocktail') ||
      catLower.contains('iced') ||
      nameLower.contains('smoothie') ||
      nameLower.contains('juice') ||
      nameLower.contains('tea') ||
      nameLower.contains('coffee') ||
      nameLower.contains('macchiato') ||
      nameLower.contains('soda') ||
      nameLower.contains('frappe') ||
      nameLower.contains('shake') ||
      nameLower.contains('drink') ||
      nameLower.contains('latte');

  final isEligibleForEgg = (nameLower.contains('fried rice') ||
          nameLower.contains('fried noodle') ||
          nameLower.contains('stir fried') ||
          catLower.contains('fried rice') ||
          catLower.contains('fried noodle')) &&
      !nameLower.contains('burger') &&
      !nameLower.contains('soup') &&
      !catLower.contains('burger') &&
      !catLower.contains('soup');

  String selectedOption = '';
  bool addEgg = false;
  String sugarLevel = '100% (Normal)';
  String iceLevel = 'Normal Ice';
  int quantity = 1;
  final TextEditingController notesController = TextEditingController();
  String? validationError;

  final sugarOptions = ['100% (Normal)', '75% (Less Sweet)', '50% (Half Sugar)', '25% (Little Sugar)', '0% (No Sugar)'];
  final iceOptions = ['Normal Ice', 'Less Ice', 'No Ice'];

  showDialog(
    context: context,
    builder: (context) {
      return StatefulBuilder(
        builder: (context, setState) {
          final eggPrice = addEgg ? 0.50 : 0.0;
          final double basePriceValue = item.price + eggPrice;
          final double totalPrice = basePriceValue * quantity;

          return AlertDialog(
            backgroundColor: AppTheme.cardBg,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
            title: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    baseName,
                    style: const TextStyle(color: AppTheme.textPrimary, fontWeight: FontWeight.bold, fontSize: 18),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close, color: AppTheme.textSecondary),
                  onPressed: () => Navigator.pop(context),
                )
              ],
            ),
            content: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  if (validationError != null)
                    Container(
                      margin: const EdgeInsets.only(bottom: 12),
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppTheme.statusCancelled.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: AppTheme.statusCancelled.withOpacity(0.3)),
                      ),
                      child: Text(
                        validationError!,
                        style: const TextStyle(color: AppTheme.statusCancelled, fontSize: 12, fontWeight: FontWeight.bold),
                      ),
                    ),

                  if (options.isNotEmpty) ...[
                    const Text('Select Choice (Required)', style: TextStyle(color: AppTheme.primaryAccent, fontWeight: FontWeight.bold, fontSize: 13)),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: options.map((opt) {
                        final isSelected = selectedOption == opt;
                        return ChoiceChip(
                          label: Text(opt),
                          selected: isSelected,
                          onSelected: (selected) {
                            if (selected) {
                              setState(() {
                                selectedOption = opt;
                                validationError = null;
                              });
                            }
                          },
                          selectedColor: AppTheme.primaryAccent.withOpacity(0.2),
                          backgroundColor: Colors.transparent,
                          checkmarkColor: AppTheme.primaryAccent,
                          side: BorderSide(
                            color: isSelected ? AppTheme.primaryAccent : AppTheme.cardBorder,
                            width: 1.5,
                          ),
                          labelStyle: TextStyle(
                            color: isSelected ? AppTheme.textPrimary : AppTheme.textSecondary,
                            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                          ),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 16),
                  ],

                  if (isEligibleForEgg) ...[
                    const Text('Add-ons', style: TextStyle(color: AppTheme.primaryAccent, fontWeight: FontWeight.bold, fontSize: 13)),
                    const SizedBox(height: 8),
                    CheckboxListTile(
                      title: Text('Add Fried Egg (+\$0.50)', style: const TextStyle(color: AppTheme.textPrimary, fontSize: 13)),
                      value: addEgg,
                      onChanged: (val) {
                        setState(() {
                          addEgg = val ?? false;
                        });
                      },
                      activeColor: AppTheme.primaryAccent,
                      checkColor: Colors.black,
                      tileColor: AppTheme.darkBg.withOpacity(0.2),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 12),
                    ),
                    const SizedBox(height: 16),
                  ],

                  if (isDrink) ...[
                    const Text('Sugar Level', style: TextStyle(color: AppTheme.primaryAccent, fontWeight: FontWeight.bold, fontSize: 13)),
                    const SizedBox(height: 8),
                    DropdownButtonFormField<String>(
                      value: sugarLevel,
                      dropdownColor: AppTheme.cardBg,
                      decoration: InputDecoration(
                        filled: true,
                        fillColor: AppTheme.darkBg.withOpacity(0.2),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppTheme.cardBorder)),
                        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppTheme.cardBorder)),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      ),
                      style: const TextStyle(color: AppTheme.textPrimary, fontSize: 13),
                      onChanged: (val) {
                        if (val != null) setState(() => sugarLevel = val);
                      },
                      items: sugarOptions.map((sug) => DropdownMenuItem(value: sug, child: Text(sug))).toList(),
                    ),
                    const SizedBox(height: 16),

                    const Text('Ice Level', style: TextStyle(color: AppTheme.primaryAccent, fontWeight: FontWeight.bold, fontSize: 13)),
                    const SizedBox(height: 8),
                    DropdownButtonFormField<String>(
                      value: iceLevel,
                      dropdownColor: AppTheme.cardBg,
                      decoration: InputDecoration(
                        filled: true,
                        fillColor: AppTheme.darkBg.withOpacity(0.2),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppTheme.cardBorder)),
                        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppTheme.cardBorder)),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      ),
                      style: const TextStyle(color: AppTheme.textPrimary, fontSize: 13),
                      onChanged: (val) {
                        if (val != null) setState(() => iceLevel = val);
                      },
                      items: iceOptions.map((ice) => DropdownMenuItem(value: ice, child: Text(ice))).toList(),
                    ),
                    const SizedBox(height: 16),
                  ],

                  const Text('Special Instructions', style: TextStyle(color: AppTheme.primaryAccent, fontWeight: FontWeight.bold, fontSize: 13)),
                  const SizedBox(height: 8),
                  TextField(
                    controller: notesController,
                    maxLines: 2,
                    style: const TextStyle(color: AppTheme.textPrimary, fontSize: 13),
                    decoration: InputDecoration(
                      hintText: 'e.g. No onions, extra spicy...',
                      hintStyle: const TextStyle(color: AppTheme.textSecondary, fontSize: 12),
                      filled: true,
                      fillColor: AppTheme.darkBg.withOpacity(0.2),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppTheme.cardBorder)),
                      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppTheme.cardBorder)),
                      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppTheme.primaryAccent)),
                      contentPadding: const EdgeInsets.all(12),
                    ),
                  ),
                  const SizedBox(height: 20),

                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Quantity', style: TextStyle(color: AppTheme.textPrimary, fontWeight: FontWeight.bold, fontSize: 14)),
                      Row(
                        children: [
                          IconButton(
                            icon: const Icon(Icons.remove_circle_outline, color: AppTheme.primaryAccent, size: 28),
                            onPressed: () {
                              if (quantity > 1) {
                                setState(() => quantity -= 1);
                              }
                            },
                          ),
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 12),
                            child: Text(
                              '$quantity',
                              style: const TextStyle(color: AppTheme.textPrimary, fontWeight: FontWeight.bold, fontSize: 16),
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.add_circle_outline, color: AppTheme.primaryAccent, size: 28),
                            onPressed: () => setState(() => quantity += 1),
                          ),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('Cancel', style: TextStyle(color: AppTheme.textSecondary)),
              ),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primaryAccent,
                  foregroundColor: Colors.black,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                ),
                onPressed: () {
                  if (options.isNotEmpty && selectedOption.isEmpty) {
                    setState(() {
                      validationError = 'Please select a required option.';
                    });
                    return;
                  }

                  // Compile custom notes
                  List<String> notesParts = [];
                  if (selectedOption.isNotEmpty) {
                    notesParts.add('Choice: $selectedOption');
                  }
                  if (isDrink) {
                    notesParts.add('Sugar: $sugarLevel');
                    notesParts.add('Ice: $iceLevel');
                  }
                  if (addEgg) {
                    notesParts.add('Add Fried Egg (+\$0.50)');
                  }
                  if (notesController.text.trim().isNotEmpty) {
                    notesParts.add(notesController.text.trim());
                  }

                  final finalNotes = notesParts.join(' | ');

                  // Add custom item
                  cartProvider.addCustomItem(
                    item,
                    price: basePriceValue,
                    quantity: quantity,
                    notes: finalNotes,
                    customName: baseName,
                  );

                  Navigator.pop(context);

                  if (!showSplitScreen) {
                    _showGlassmorphicToast(context, baseName);
                  }
                },
                child: Text('Add to Order (\$${totalPrice.toStringAsFixed(2)})', style: const TextStyle(fontWeight: FontWeight.bold)),
              ),
            ],
          );
        },
      );
    },
  );
}

// Custom Premium Glassmorphic Top Toast
void _showGlassmorphicToast(BuildContext context, String itemName) {
  final overlay = Overlay.of(context);
  late OverlayEntry overlayEntry;

  overlayEntry = OverlayEntry(
    builder: (context) => _ToastWidget(
      itemName: itemName,
      onDismiss: () => overlayEntry.remove(),
    ),
  );

  overlay.insert(overlayEntry);
}

class _ToastWidget extends StatefulWidget {
  final String itemName;
  final VoidCallback onDismiss;

  const _ToastWidget({
    required this.itemName,
    required this.onDismiss,
  });

  @override
  State<_ToastWidget> createState() => _ToastWidgetState();
}

class _ToastWidgetState extends State<_ToastWidget> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _opacityAnimation;
  late Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 200),
    );

    _opacityAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeOut),
    );

    _slideAnimation = Tween<Offset>(begin: const Offset(0, -0.4), end: Offset.zero).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeOut),
    );

    _controller.forward();

    // Fade out and dismiss after 650ms
    Future.delayed(const Duration(milliseconds: 650), () async {
      if (mounted) {
        await _controller.reverse();
        widget.onDismiss();
      }
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final double screenWidth = MediaQuery.of(context).size.width;
    final double toastWidth = screenWidth > 600 ? 320 : screenWidth - 48;

    return Positioned(
      top: MediaQuery.of(context).padding.top + 16,
      left: (screenWidth - toastWidth) / 2,
      width: toastWidth,
      child: Material(
        color: Colors.transparent,
        child: FadeTransition(
          opacity: _opacityAnimation,
          child: SlideTransition(
            position: _slideAnimation,
            child: Align(
              alignment: Alignment.topCenter,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                decoration: BoxDecoration(
                  color: Colors.black.withOpacity(0.85),
                  borderRadius: BorderRadius.circular(30),
                  border: Border.all(
                    color: AppTheme.primaryAccent.withOpacity(0.3),
                    width: 1.5,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.4),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(
                      Icons.check_circle_rounded,
                      color: AppTheme.primaryAccent,
                      size: 16,
                    ),
                    const SizedBox(width: 8),
                    Flexible(
                      child: Text(
                        '${widget.itemName} added',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
