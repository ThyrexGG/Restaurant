import 'package:flutter/foundation.dart';
import '../services/auth_service.dart';

enum AuthStatus { checking, loggedOut, loggedIn }

class AuthProvider with ChangeNotifier {
  final AuthService _service = AuthService();

  AuthStatus _status = AuthStatus.checking;
  String? _token;
  bool _serverWaking = false;
  bool _busy = false;
  String? _error;

  AuthStatus get status => _status;
  String? get token => _token;
  bool get serverWaking => _serverWaking;
  bool get busy => _busy;
  String? get error => _error;

  /// Called once at startup. Retries until the backend answers, because a sleeping
  /// free-tier server can take ~30s to respond to the first request.
  Future<void> init() async {
    _token = await _service.loadToken();
    while (true) {
      try {
        final result = await _service.check(_token);
        _serverWaking = false;
        if (!result.authRequired || result.valid) {
          _status = AuthStatus.loggedIn;
        } else {
          _token = null;
          await _service.saveToken(null);
          _status = AuthStatus.loggedOut;
        }
        notifyListeners();
        return;
      } catch (_) {
        _serverWaking = true;
        notifyListeners();
        await Future.delayed(const Duration(seconds: 3));
      }
    }
  }

  Future<void> login(String password) async {
    _busy = true;
    _error = null;
    notifyListeners();
    try {
      final token = await _service.login(password);
      _token = token;
      await _service.saveToken(token);
      _status = AuthStatus.loggedIn;
    } on AuthException catch (e) {
      _error = e.message;
    } finally {
      _busy = false;
      notifyListeners();
    }
  }

  Future<void> logout() async {
    _token = null;
    await _service.saveToken(null);
    _status = AuthStatus.loggedOut;
    notifyListeners();
  }

  /// The server refused an admin action (expired or invalid token).
  void handleAuthRejected() {
    if (_status == AuthStatus.loggedIn) {
      _error = 'Session expired. Please sign in again.';
      logout();
    }
  }
}
