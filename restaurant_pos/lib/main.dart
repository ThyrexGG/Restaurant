import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'providers/auth_provider.dart';
import 'providers/cart_provider.dart';
import 'providers/pos_provider.dart';
import 'providers/order_provider.dart';
import 'theme/app_theme.dart';
import 'views/login_view.dart';
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
        ChangeNotifierProvider(create: (_) => AuthProvider()..init()),
        ChangeNotifierProvider(create: (_) => CartProvider()),
        ChangeNotifierProvider(create: (_) => PosProvider()),
        ChangeNotifierProxyProvider<AuthProvider, OrderProvider>(
          create: (_) => OrderProvider()..initSocket(),
          update: (_, auth, orders) {
            orders!.onAuthRejected = auth.handleAuthRejected;
            orders.applyAuth(auth.status == AuthStatus.loggedIn, auth.token);
            return orders;
          },
        ),
      ],
      child: MaterialApp(
        title: 'BKR Pos',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.darkTheme,
        scrollBehavior: MyCustomScrollBehavior(),
        home: const AuthGate(),
      ),
    );
  }
}

/// Shows the login screen until staff are signed in, then the POS.
class AuthGate extends StatelessWidget {
  const AuthGate({super.key});

  @override
  Widget build(BuildContext context) {
    final status = context.watch<AuthProvider>().status;
    return status == AuthStatus.loggedIn ? const MainLayoutInitializer() : const LoginView();
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
