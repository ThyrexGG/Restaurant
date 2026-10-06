import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../theme/app_theme.dart';

class LoginView extends StatefulWidget {
  const LoginView({super.key});

  @override
  State<LoginView> createState() => _LoginViewState();
}

class _LoginViewState extends State<LoginView> {
  final TextEditingController _controller = TextEditingController();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _submit(AuthProvider auth) {
    final password = _controller.text;
    if (password.isEmpty || auth.busy) return;
    auth.login(password);
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();

    return Scaffold(
      backgroundColor: AppTheme.darkBg,
      body: Center(
        child: auth.status == AuthStatus.checking
            ? Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const CircularProgressIndicator(color: AppTheme.primaryAccent),
                  const SizedBox(height: 16),
                  Text(
                    auth.serverWaking
                        ? 'Server is waking up, this can take up to 30 seconds...'
                        : 'Loading...',
                    style: const TextStyle(color: AppTheme.textSecondary),
                  ),
                ],
              )
            : ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 360),
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      const Icon(Icons.lock_outline, color: AppTheme.primaryAccent, size: 36),
                      const SizedBox(height: 12),
                      const Text(
                        'Staff Login',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: AppTheme.textPrimary,
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 24),
                      TextField(
                        controller: _controller,
                        obscureText: true,
                        autofocus: true,
                        onSubmitted: (_) => _submit(auth),
                        decoration: const InputDecoration(
                          labelText: 'Password',
                          border: OutlineInputBorder(),
                        ),
                      ),
                      if (auth.error != null) ...[
                        const SizedBox(height: 12),
                        Text(
                          auth.error!,
                          style: const TextStyle(color: AppTheme.statusCancelled),
                        ),
                      ],
                      const SizedBox(height: 20),
                      FilledButton(
                        onPressed: auth.busy ? null : () => _submit(auth),
                        style: FilledButton.styleFrom(
                          backgroundColor: AppTheme.primaryAccent,
                          foregroundColor: Colors.black,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                        ),
                        child: Text(auth.busy ? 'Signing in...' : 'Sign in'),
                      ),
                    ],
                  ),
                ),
              ),
      ),
    );
  }
}
