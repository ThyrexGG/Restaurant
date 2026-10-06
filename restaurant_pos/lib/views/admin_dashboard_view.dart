import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../theme/app_theme.dart';

class AdminDashboardView extends StatefulWidget {
  const AdminDashboardView({super.key});

  @override
  State<AdminDashboardView> createState() => _AdminDashboardViewState();
}

class _AdminDashboardViewState extends State<AdminDashboardView> {
  late final WebViewController _controller;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(AppTheme.darkBg)
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (String url) {
            setState(() {
              _isLoading = true;
            });
          },
          onPageFinished: (String url) {
            // Hand the staff login to the embedded website so it doesn't ask again
            final token = context.read<AuthProvider>().token;
            if (token != null && token.isNotEmpty) {
              _controller.runJavaScript('''
                if (localStorage.getItem('admin_token') !== '$token') {
                  localStorage.setItem('admin_token', '$token');
                  location.reload();
                }
              ''');
            }
            // Seamlessly hide the website top navigation bar
            _controller.runJavaScript('''
              var nav = document.querySelector('nav');
              if (nav) {
                nav.style.display = 'none';
              }
            ''');
            setState(() {
              _isLoading = false;
            });
          },
        ),
      )
      ..loadRequest(Uri.parse('https://restaurant-three-chi-91.vercel.app/admin?tab=Analytics'));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.darkBg,
      body: Stack(
        children: [
          WebViewWidget(controller: _controller),
          if (_isLoading)
            const Center(
              child: CircularProgressIndicator(
                color: AppTheme.primaryAccent,
                strokeWidth: 3,
              ),
            ),
        ],
      ),
    );
  }
}
