import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/menu_item.dart';

class ApiService {
  static const String baseUrl = 'https://restaurant-pjwk.onrender.com';
  
  // Point this to your frontend server where the public/images folder is hosted.
  // In local development, run the React frontend (npm run dev) and use http://localhost:5173.
  // In production, set this to your deployed website URL (e.g. https://your-site.vercel.app).
  static const String imageBaseUrl = 'https://restaurant-three-chi-91.vercel.app';

  Future<List<MenuItem>> fetchMenu() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/api/menu'));

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((item) => MenuItem.fromJson(item)).toList();
      } else {
        throw Exception('Failed to load menu. Server responded with status: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Network error while fetching menu: $e');
    }
  }
}
