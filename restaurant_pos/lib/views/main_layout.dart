import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../providers/pos_provider.dart';
import '../providers/order_provider.dart';
import '../theme/app_theme.dart';
import 'pos_view.dart';
import 'orders_view.dart';
import 'admin_dashboard_view.dart';

class MainLayout extends StatefulWidget {
  const MainLayout({super.key});

  @override
  State<MainLayout> createState() => _MainLayoutState();
}

class _MainLayoutState extends State<MainLayout> {
  late Timer _clockTimer;
  String _currentTime = '';

  @override
  void initState() {
    super.initState();
    _updateTime();
    _clockTimer = Timer.periodic(const Duration(seconds: 1), (_) => _updateTime());
  }

  @override
  void dispose() {
    _clockTimer.cancel();
    super.dispose();
  }

  void _updateTime() {
    final now = DateTime.now();
    final formattedTime = DateFormat('hh:mm:ss a • E, MMM d').format(now);
    if (mounted) {
      setState(() {
        _currentTime = formattedTime;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final posProvider = Provider.of<PosProvider>(context);
    final orderProvider = Provider.of<OrderProvider>(context);

    // List of screens corresponding to tab indices
    final List<Widget> screens = [
      const PosView(),
      const OrdersView(),
      const AdminDashboardView(),
    ];

    // Determine layout width (Desktop/Tablet vs Mobile)
    final double screenWidth = MediaQuery.of(context).size.width;
    final bool isWideScreen = screenWidth > 800;

    return Scaffold(
      body: SafeArea(
        child: Row(
          children: [
            // Sidebar (only on desktop/tablet)
            if (isWideScreen) _buildSidebar(posProvider, orderProvider),

            // Main Content Area
            Expanded(
              child: Column(
                children: [
                  // Top Header Panel
                  _buildHeader(posProvider, orderProvider, isWideScreen),
                  
                  // Screen Content
                  Expanded(
                    child: screens[posProvider.activeTabIndex],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
      // Drawer on smaller screens
      drawer: !isWideScreen ? Drawer(
        child: Container(
          color: AppTheme.darkBg,
          child: Column(
            children: [
              _buildSidebarHeader(orderProvider),
              const Divider(),
              _buildDrawerItem(
                context,
                icon: Icons.point_of_sale_rounded,
                title: 'POS Catalog',
                index: 0,
                activeTab: posProvider.activeTabIndex,
                onTap: () {
                  posProvider.setActiveTab(0);
                  Navigator.pop(context);
                },
              ),
              _buildDrawerItem(
                context,
                icon: Icons.list_alt_rounded,
                title: 'Active Orders',
                index: 1,
                activeTab: posProvider.activeTabIndex,
                badgeCount: orderProvider.orders.length,
                onTap: () {
                  posProvider.setActiveTab(1);
                  Navigator.pop(context);
                },
              ),
              _buildDrawerItem(
                context,
                icon: Icons.analytics_rounded,
                title: 'Sales Analytics',
                index: 2,
                activeTab: posProvider.activeTabIndex,
                onTap: () {
                  posProvider.setActiveTab(2);
                  Navigator.pop(context);
                },
              ),
            ],
          ),
        ),
      ) : null,
    );
  }

  // Large screen sidebar
  Widget _buildSidebar(PosProvider posProvider, OrderProvider orderProvider) {
    return Container(
      width: 250,
      decoration: const BoxDecoration(
        color: AppTheme.cardBg,
        border: Border(right: BorderSide(color: AppTheme.cardBorder, width: 1.5)),
      ),
      child: Column(
        children: [
          _buildSidebarHeader(orderProvider),
          const Divider(),
          const SizedBox(height: 10),
          _buildSidebarNavItem(
            icon: Icons.point_of_sale_rounded,
            title: 'POS Catalog',
            index: 0,
            activeTab: posProvider.activeTabIndex,
            onTap: () => posProvider.setActiveTab(0),
          ),
          _buildSidebarNavItem(
            icon: Icons.list_alt_rounded,
            title: 'Active Orders',
            index: 1,
            activeTab: posProvider.activeTabIndex,
            badgeCount: orderProvider.orders.length,
            onTap: () => posProvider.setActiveTab(1),
          ),
          _buildSidebarNavItem(
            icon: Icons.analytics_rounded,
            title: 'Sales Analytics',
            index: 2,
            activeTab: posProvider.activeTabIndex,
            onTap: () => posProvider.setActiveTab(2),
          ),
          const Spacer(),
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Text(
              'v1.0.0 Stable',
              style: TextStyle(color: AppTheme.textSecondary.withOpacity(0.5), fontSize: 11),
            ),
          )
        ],
      ),
    );
  }

  Widget _buildSidebarHeader(OrderProvider orderProvider) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 24.0),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(4),
            decoration: BoxDecoration(
              color: AppTheme.primaryAccent.withOpacity(0.08),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: AppTheme.primaryAccent.withOpacity(0.15),
                width: 1,
              ),
            ),
            child: Image.asset(
              'assets/images/logo.png',
              width: 38,
              height: 38,
              fit: BoxFit.contain,
            ),
          ),
          const SizedBox(width: 12),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Best Khmer Restaurant',
                  style: TextStyle(
                    color: AppTheme.textPrimary,
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  'POS Terminal',
                  style: TextStyle(
                    color: AppTheme.textSecondary,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSidebarNavItem({
    required IconData icon,
    required String title,
    required int index,
    required int activeTab,
    required VoidCallback onTap,
    int badgeCount = 0,
  }) {
    final isSelected = index == activeTab;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 4.0),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          decoration: BoxDecoration(
            color: isSelected ? AppTheme.primaryAccent.withOpacity(0.1) : Colors.transparent,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: isSelected ? AppTheme.primaryAccent.withOpacity(0.3) : Colors.transparent,
              width: 1.5,
            ),
          ),
          child: Row(
            children: [
              Icon(
                icon,
                color: isSelected ? AppTheme.primaryAccent : AppTheme.textSecondary,
                size: 22,
              ),
              const SizedBox(width: 12),
              Text(
                title,
                style: TextStyle(
                  color: isSelected ? AppTheme.textPrimary : AppTheme.textSecondary,
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                  fontSize: 14,
                ),
              ),
              const Spacer(),
              if (badgeCount > 0)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: AppTheme.primaryAccent,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(
                    '$badgeCount',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDrawerItem(
    BuildContext context, {
    required IconData icon,
    required String title,
    required int index,
    required int activeTab,
    required VoidCallback onTap,
    int badgeCount = 0,
  }) {
    final isSelected = index == activeTab;
    return ListTile(
      leading: Icon(icon, color: isSelected ? AppTheme.primaryAccent : AppTheme.textSecondary),
      title: Text(title, style: TextStyle(color: isSelected ? AppTheme.textPrimary : AppTheme.textSecondary)),
      trailing: badgeCount > 0 ? Badge.count(count: badgeCount) : null,
      selected: isSelected,
      onTap: onTap,
    );
  }

  // Header panel displaying clock, WebSocket status, and triggers
  Widget _buildHeader(PosProvider posProvider, OrderProvider orderProvider, bool isWideScreen) {
    return Container(
      height: 70,
      padding: EdgeInsets.symmetric(horizontal: isWideScreen ? 20 : 12),
      decoration: const BoxDecoration(
        color: AppTheme.cardBg,
        border: Border(bottom: BorderSide(color: AppTheme.cardBorder, width: 1.5)),
      ),
      child: Row(
        children: [
          // Menu button on mobile
          if (!isWideScreen)
            Builder(
              builder: (context) => IconButton(
                icon: const Icon(Icons.menu_rounded, color: AppTheme.textPrimary),
                onPressed: () => Scaffold.of(context).openDrawer(),
              ),
            ),
          
          if (!isWideScreen) const SizedBox(width: 8),

          Expanded(
            child: Text(
              posProvider.activeTabIndex == 0
                  ? 'POS Catalog'
                  : posProvider.activeTabIndex == 1
                      ? 'Live Active Orders'
                      : 'Sales Analytics',
              style: const TextStyle(
                color: AppTheme.textPrimary,
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
              overflow: TextOverflow.ellipsis,
            ),
          ),
          
          const SizedBox(width: 8),

          // Clock display
          if (isWideScreen) ...[
            Text(
              _currentTime,
              style: const TextStyle(
                color: AppTheme.textSecondary,
                fontSize: 14,
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(width: 24),
          ],

          // Refresh Menu Button
          IconButton(
            tooltip: 'Reload Menu',
            icon: const Icon(Icons.refresh_rounded, color: AppTheme.textSecondary),
            onPressed: () {
              posProvider.loadMenu();
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Refreshing menu items...'),
                  duration: Duration(seconds: 1),
                ),
              );
            },
          ),
          SizedBox(width: isWideScreen ? 12 : 6),

          // Socket connection status badge
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: orderProvider.isSocketConnected
                  ? AppTheme.statusDelivered.withOpacity(0.1)
                  : AppTheme.statusCancelled.withOpacity(0.1),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: orderProvider.isSocketConnected
                    ? AppTheme.statusDelivered.withOpacity(0.4)
                    : AppTheme.statusCancelled.withOpacity(0.4),
                width: 1.5,
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 8,
                  height: 8,
                  decoration: BoxDecoration(
                    color: orderProvider.isSocketConnected
                        ? AppTheme.statusDelivered
                        : AppTheme.statusCancelled,
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: orderProvider.isSocketConnected
                            ? AppTheme.statusDelivered.withOpacity(0.5)
                            : AppTheme.statusCancelled.withOpacity(0.5),
                        blurRadius: 4,
                        spreadRadius: 1,
                      )
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                Text(
                  orderProvider.isSocketConnected ? 'LIVE FEED' : 'OFFLINE',
                  style: TextStyle(
                    color: orderProvider.isSocketConnected
                        ? AppTheme.statusDelivered
                        : AppTheme.statusCancelled,
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 0.5,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
