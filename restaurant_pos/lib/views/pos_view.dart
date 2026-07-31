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
    final bool showSplitScreen = width > 1000;

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
                return FloatingActionButton.extended(
                  onPressed: () => _showCartDrawer(context),
                  backgroundColor: AppTheme.primaryAccent,
                  icon: const Badge(
                    label: Text(''),
                    child: Icon(Icons.shopping_cart_rounded, color: Colors.white),
                  ),
                  label: Text('View Order (\$${cartProvider.totalAmount.toStringAsFixed(2)})'),
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
        return FractionallySizedBox(
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

    return InkWell(
      onTap: () {
        cartProvider.addItem(item);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('${item.name} added to cart'),
            duration: const Duration(milliseconds: 600),
            backgroundColor: AppTheme.primaryAccent,
          ),
        );
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
                  Text(
                    item.name,
                    style: const TextStyle(
                      color: AppTheme.textPrimary,
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
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
