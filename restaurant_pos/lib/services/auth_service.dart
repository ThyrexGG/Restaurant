import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'api_service.dart';

class AuthException implements Exception {
  final String message;
  AuthException(this.message);
  @override
  String toString() => message;
}

class AuthService {
  static const String _tokenKey = 'admin_token';

  Future<String?> loadToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_tokenKey);
  }

  Future<void> saveToken(String? token) async {
    final prefs = await SharedPreferences.getInstance();
    if (token == null || token.isEmpty) {
      await prefs.remove(_tokenKey);
    } else {
      await prefs.setString(_tokenKey, token);
    }
  }

  /// Asks the backend whether a login is needed and whether [token] is still valid.
  /// Throws on network errors so the caller can retry while the server wakes up.
  Future<({bool authRequired, bool valid})> check(String? token) async {
    final response = await http
        .get(
          Uri.parse('${ApiService.baseUrl}/api/auth/check'),
          headers: {if (token != null && token.isNotEmpty) 'Authorization': 'Bearer $token'},
        )
        .timeout(const Duration(seconds: 60));
    if (response.statusCode != 200) {
      throw Exception('Auth check failed: ${response.statusCode}');
    }
    final data = jsonDecode(response.body) as Map<String, dynamic>;
    return (authRequired: data['authRequired'] == true, valid: data['valid'] == true);
  }

  /// Returns a JWT, or throws [AuthException] with a message safe to show to staff.
  Future<String> login(String password) async {
    try {
      final response = await http
          .post(
            Uri.parse('${ApiService.baseUrl}/api/auth/login'),
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode({'password': password}),
          )
          .timeout(const Duration(seconds: 60));
      final data = jsonDecode(response.body) as Map<String, dynamic>;
      if (response.statusCode == 200) return (data['token'] ?? '').toString();
      throw AuthException((data['error'] ?? 'Login failed').toString());
    } on AuthException {
      rethrow;
    } catch (_) {
      throw AuthException('Cannot reach the server. Try again in a moment.');
    }
  }
}
