import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../providers/order_provider.dart';
import '../models/order.dart';
import '../theme/app_theme.dart';

class OrdersView extends StatefulWidget {
  const OrdersView({super.key});

  @override
  State<OrdersView> createState() => _OrdersViewState();
}

class _OrdersViewState extends State<OrdersView> with SingleTickerProviderStateMixin {
  TabController? _tabController;

  @override
  Widget build(BuildContext context) {
    final orderProvider = Provider.of<OrderProvider>(context);
    final width = MediaQuery.of(context).size.width;
    final isWideScreen = width > 900;

    // Filter active orders by status
    final newOrders = orderProvider.orders.where((o) => o.status == 'NEW').toList();
    final cookingOrders = orderProvider.orders.where((o) => o.status == 'COOKING').toList();
    // In some backends it might use READY instead of DELIVERED, let's support both
    final deliveredOrders = orderProvider.orders.where((o) => o.status == 'DELIVERED' || o.status == 'READY').toList();

    if (orderProvider.orders.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: AppTheme.cardBg,
                shape: BoxShape.circle,
                border: Border.all(color: AppTheme.cardBorder, width: 1.5),
              ),
              child: const Icon(
                Icons.assignment_turned_in_rounded,
                size: 64,
                color: AppTheme.textSecondary,
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              'No Active Orders',
              style: TextStyle(
                color: AppTheme.textPrimary,
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Orders placed by customers or POS will appear here live.',
              style: TextStyle(color: AppTheme.textSecondary),
            ),
          ],
        ),
      );
    }

    if (isWideScreen) {
      // Large screen: Side-by-side Kanban Columns
      return Padding(
        padding: const EdgeInsets.all(16.0),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: _buildKanbanColumn(
                context,
                title: 'New Feed',
                count: newOrders.length,
                color: AppTheme.statusNew,
                orders: newOrders,
                orderProvider: orderProvider,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: _buildKanbanColumn(
                context,
                title: 'In Preparation',
                count: cookingOrders.length,
                color: AppTheme.statusCooking,
                orders: cookingOrders,
                orderProvider: orderProvider,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: _buildKanbanColumn(
                context,
                title: 'Ready for Pickup',
                count: deliveredOrders.length,
                color: AppTheme.statusDelivered,
                orders: deliveredOrders,
                orderProvider: orderProvider,
              ),
            ),
          ],
        ),
      );
    } else {
      // Small screen: Tabbed View
      _tabController ??= TabController(length: 3, vsync: this);
      return Column(
        children: [
          TabBar(
            controller: _tabController,
            indicatorColor: AppTheme.primaryAccent,
            labelColor: AppTheme.textPrimary,
            unselectedLabelColor: AppTheme.textSecondary,
            tabs: [
              Tab(text: 'New (${newOrders.length})'),
              Tab(text: 'Cooking (${cookingOrders.length})'),
              Tab(text: 'Ready (${deliveredOrders.length})'),
            ],
          ),
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                _buildListView(context, newOrders, orderProvider),
                _buildListView(context, cookingOrders, orderProvider),
                _buildListView(context, deliveredOrders, orderProvider),
              ],
            ),
          ),
        ],
      );
    }
  }

  Widget _buildKanbanColumn(
    BuildContext context, {
    required String title,
    required int count,
    required Color color,
    required List<Order> orders,
    required OrderProvider orderProvider,
  }) {
    return Container(
      decoration: AppTheme.glassBoxDecoration(
        bgColor: AppTheme.cardBg.withOpacity(0.4),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Column Header Banner
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            decoration: BoxDecoration(
              color: color.withOpacity(0.08),
              borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
              border: Border(bottom: BorderSide(color: AppTheme.cardBorder, width: 1.5)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      width: 10,
                      height: 10,
                      decoration: BoxDecoration(color: color, shape: BoxShape.circle),
                    ),
                    const SizedBox(width: 10),
                    Text(
                      title,
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 15,
                        color: AppTheme.textPrimary,
                      ),
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 2),
                  decoration: BoxDecoration(
                    color: AppTheme.cardBorder,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    '$count',
                    style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.textPrimary),
                  ),
                )
              ],
            ),
          ),

          // Cards list
          Expanded(
            child: orders.isEmpty
                ? Center(
                    child: Padding(
                      padding: const EdgeInsets.all(20.0),
                      child: Text(
                        'Empty',
                        style: TextStyle(color: AppTheme.textSecondary.withOpacity(0.5), fontSize: 13),
                      ),
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(12),
                    itemCount: orders.length,
                    itemBuilder: (context, index) {
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 12.0),
                        child: OrderCard(order: orders[index], orderProvider: orderProvider),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildListView(BuildContext context, List<Order> orders, OrderProvider orderProvider) {
    if (orders.isEmpty) {
      return const Center(
        child: Text('No orders in this status', style: TextStyle(color: AppTheme.textSecondary)),
      );
    }
    return ListView.builder(
      padding: const EdgeInsets.all(12),
      itemCount: orders.length,
      itemBuilder: (context, index) {
        return Padding(
          padding: const EdgeInsets.only(bottom: 12.0),
          child: OrderCard(order: orders[index], orderProvider: orderProvider),
        );
      },
    );
  }
}

class OrderCard extends StatelessWidget {
  final Order order;
  final OrderProvider orderProvider;

  const OrderCard({
    super.key,
    required this.order,
    required this.orderProvider,
  });

  String _formatTime(DateTime? dt) {
    if (dt == null) return 'Just now';
    // Format to local time e.g. 15:30
    return DateFormat('hh:mm a').format(dt.toLocal());
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: AppTheme.glassBoxDecoration(
        bgColor: AppTheme.cardBg,
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Row: Table details, Time, Order type badge
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    order.table == 'Takeaway' ? 'Takeaway' : 'Table ${order.table}',
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                      color: AppTheme.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'Order #${order.dailyOrderNumber ?? order.id.substring(0, 4)}',
                    style: const TextStyle(
                      color: AppTheme.textSecondary,
                      fontSize: 11,
                    ),
                  ),
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: order.type == 'DINE_IN'
                          ? AppTheme.primaryAccent.withOpacity(0.1)
                          : AppTheme.statusCooking.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(
                        color: order.type == 'DINE_IN'
                            ? AppTheme.primaryAccent.withOpacity(0.3)
                            : AppTheme.statusCooking.withOpacity(0.3),
                      ),
                    ),
                    child: Text(
                      order.type == 'DINE_IN' ? 'DINE-IN' : 'TAKE OUT',
                      style: TextStyle(
                        color: order.type == 'DINE_IN' ? AppTheme.primaryAccent : AppTheme.statusCooking,
                        fontSize: 9,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    _formatTime(order.timestamp),
                    style: const TextStyle(color: AppTheme.textSecondary, fontSize: 11),
                  ),
                ],
              ),
            ],
          ),

          const Divider(height: 20),

          // Items list
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: order.items.length,
            itemBuilder: (context, idx) {
              final item = order.items[idx];
              return Padding(
                padding: const EdgeInsets.only(bottom: 6.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(
                          '${item.quantity}x',
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            color: AppTheme.primaryAccent,
                            fontSize: 13,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            item.name,
                            style: const TextStyle(
                              color: AppTheme.textPrimary,
                              fontWeight: FontWeight.w500,
                              fontSize: 13,
                            ),
                          ),
                        ),
                        Text(
                          '\$${item.subtotal.toStringAsFixed(2)}',
                          style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12),
                        ),
                      ],
                    ),
                    if (item.notes.isNotEmpty)
                      Padding(
                        padding: const EdgeInsets.only(left: 26.0, top: 2.0),
                        child: Text(
                          '• Note: "${item.notes}"',
                          style: const TextStyle(
                            color: AppTheme.statusCooking,
                            fontStyle: FontStyle.italic,
                            fontSize: 11,
                          ),
                        ),
                      ),
                  ],
                ),
              );
            },
          ),

          const Divider(height: 20),

          // Order Total & Action buttons
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Total Bill', style: TextStyle(color: AppTheme.textSecondary, fontSize: 11)),
                  Text(
                    '\$${order.total.toStringAsFixed(2)}',
                    style: const TextStyle(
                      color: AppTheme.statusDelivered,
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                ],
              ),
              _buildActionButtons(context),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildActionButtons(BuildContext context) {
    switch (order.status.toUpperCase()) {
      case 'NEW':
        return Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            IconButton(
              tooltip: 'Cancel Order',
              icon: const Icon(Icons.close_rounded, color: AppTheme.statusCancelled),
              onPressed: () => _confirmStatusChange(context, 'CANCELLED', 'Cancel this order?'),
            ),
            const SizedBox(width: 8),
            ElevatedButton(
              onPressed: () => orderProvider.updateOrderStatus(order.id, 'COOKING'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.statusCooking,
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              ),
              child: const Text('PREPARE', style: TextStyle(fontSize: 12)),
            ),
          ],
        );
      case 'COOKING':
        return Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            IconButton(
              tooltip: 'Cancel Order',
              icon: const Icon(Icons.close_rounded, color: AppTheme.statusCancelled),
              onPressed: () => _confirmStatusChange(context, 'CANCELLED', 'Cancel this order?'),
            ),
            const SizedBox(width: 8),
            ElevatedButton(
              onPressed: () => orderProvider.updateOrderStatus(order.id, 'DELIVERED'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.statusDelivered,
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              ),
              child: const Text('SERVE', style: TextStyle(fontSize: 12)),
            ),
          ],
        );
      case 'READY':
      case 'DELIVERED':
        return Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            IconButton(
              tooltip: 'Cancel Order',
              icon: const Icon(Icons.close_rounded, color: AppTheme.statusCancelled),
              onPressed: () => _confirmStatusChange(context, 'CANCELLED', 'Cancel this order?'),
            ),
            const SizedBox(width: 8),
            ElevatedButton(
              onPressed: () => orderProvider.updateOrderStatus(order.id, 'PAID'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.statusPaid,
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              ),
              child: const Text('CHECKOUT', style: TextStyle(fontSize: 12)),
            ),
          ],
        );
      default:
        return const SizedBox.shrink();
    }
  }

  void _confirmStatusChange(BuildContext context, String targetStatus, String title) {
    showDialog(
      context: context,
      builder: (BuildContext dialogCtx) {
        return AlertDialog(
          backgroundColor: AppTheme.cardBg,
          title: Text(title, style: const TextStyle(color: AppTheme.textPrimary)),
          content: Text('This will set the order status to $targetStatus.', style: const TextStyle(color: AppTheme.textSecondary)),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16), side: const BorderSide(color: AppTheme.cardBorder)),
          actions: [
            TextButton(
              child: const Text('NO', style: TextStyle(color: AppTheme.textSecondary)),
              onPressed: () => Navigator.of(dialogCtx).pop(),
            ),
            TextButton(
              child: const Text('YES, CONFIRM', style: TextStyle(color: AppTheme.statusCancelled)),
              onPressed: () {
                orderProvider.updateOrderStatus(order.id, targetStatus);
                Navigator.of(dialogCtx).pop();
              },
            ),
          ],
        );
      },
    );
  }
}
