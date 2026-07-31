import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'providers/cart_provider.dart';
import 'providers/pos_provider.dart';
import 'providers/order_provider.dart';
import 'theme/app_theme.dart';
import 'views/main_layout.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const RestaurantPosApp());
}

class MyCustomScrollBehavior extends MaterialScrollBehavior {
  @override
  Set<PointerDeviceKind> get dragDevices => {
        PointerDeviceKind.touch,
        PointerDeviceKind.mouse,
        PointerDeviceKind.trackpad,
      };
}

class RestaurantPosApp extends StatelessWidget {
  const RestaurantPosApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => CartProvider()),
        ChangeNotifierProvider(create: (_) => PosProvider()),
        ChangeNotifierProvider(
          create: (_) => OrderProvider()..initSocket(),
        ),
      ],
      child: MaterialApp(
        title: 'Restaurant POS',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.darkTheme,
        scrollBehavior: MyCustomScrollBehavior(),
        home: const MainLayoutInitializer(),
      ),
    );
  }
}

class MainLayoutInitializer extends StatefulWidget {
  const MainLayoutInitializer({super.key});

  @override
  State<MainLayoutInitializer> createState() => _MainLayoutInitializerState();
}

class _MainLayoutInitializerState extends State<MainLayoutInitializer> {
  @override
  void initState() {
    super.initState();
    // Load the menu from HTTP API on startup
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<PosProvider>(context, listen: false).loadMenu();
    });
  }

  @override
  Widget build(BuildContext context) {
    return const MainLayout();
  }
}
