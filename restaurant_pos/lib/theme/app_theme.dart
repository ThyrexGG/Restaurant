import 'package:flutter/material.dart';

class AppTheme {
  // Theme Colors
  static const Color darkBg = Color(0xFF050505); // Rich deep black
  static const Color cardBg = Color(0xFF121212); // Sleek dark carbon
  static const Color cardBorder = Color(0xFF222222); // Dark borders
  static const Color textPrimary = Color(0xFFF8FAFC); // Clean white
  static const Color textSecondary = Color(0xFFA3A3A3); // Premium muted gray
  static const Color primaryAccent = Color(0xFFD4AF37); // Metallic Gold
  static const Color primaryHover = Color(0xFFB8972E); // Darker Gold

  // Status Colors
  static const Color statusNew = Color(0xFF3B82F6); // Blue 500
  static const Color statusCooking = Color(0xFFF59E0B); // Amber 500
  static const Color statusDelivered = Color(0xFF10B981); // Emerald 500
  static const Color statusCancelled = Color(0xFFEF4444); // Red 500
  static const Color statusPaid = Color(0xFF8B5CF6); // Violet 500

  static ThemeData get darkTheme {
    return ThemeData.dark().copyWith(
      scaffoldBackgroundColor: darkBg,
      primaryColor: primaryAccent,
      cardColor: cardBg,
      colorScheme: const ColorScheme.dark(
        primary: primaryAccent,
        secondary: primaryAccent,
        surface: cardBg,
        error: statusCancelled,
      ),
      textTheme: const TextTheme(
        headlineMedium: TextStyle(
          color: textPrimary,
          fontSize: 24,
          fontWeight: FontWeight.bold,
          letterSpacing: -0.5,
        ),
        titleLarge: TextStyle(
          color: textPrimary,
          fontSize: 18,
          fontWeight: FontWeight.w600,
        ),
        titleMedium: TextStyle(
          color: textPrimary,
          fontSize: 16,
          fontWeight: FontWeight.w500,
        ),
        bodyLarge: TextStyle(
          color: textPrimary,
          fontSize: 14,
        ),
        bodyMedium: TextStyle(
          color: textSecondary,
          fontSize: 13,
        ),
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: cardBg,
        elevation: 0,
        iconTheme: IconThemeData(color: textPrimary),
        titleTextStyle: TextStyle(
          color: textPrimary,
          fontSize: 20,
          fontWeight: FontWeight.bold,
        ),
      ),
      cardTheme: CardThemeData(
        color: cardBg,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: cardBorder, width: 1.5),
        ),
      ),
      dividerTheme: const DividerThemeData(
        color: cardBorder,
        thickness: 1.5,
        space: 16,
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Color(0xFF0B0F19), // Deeper Slate
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: cardBorder, width: 1.5),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: cardBorder, width: 1.5),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: primaryAccent, width: 2),
        ),
        hintStyle: const TextStyle(color: textSecondary),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryAccent,
          foregroundColor: Colors.black,
          elevation: 0,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          textStyle: const TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.bold,
            letterSpacing: 0.5,
          ),
        ),
      ),
    );
  }

  // Get status label background/text colors
  static Color getStatusColor(String status) {
    switch (status.toUpperCase()) {
      case 'NEW':
        return statusNew;
      case 'COOKING':
        return statusCooking;
      case 'DELIVERED':
      case 'READY':
        return statusDelivered;
      case 'PAID':
        return statusPaid;
      case 'CANCELLED':
        return statusCancelled;
      default:
        return textSecondary;
    }
  }

  // Glassmorphic border utility
  static BoxDecoration glassBoxDecoration({
    Color bgColor = cardBg,
    double radius = 16,
    Color borderColor = cardBorder,
  }) {
    return BoxDecoration(
      color: bgColor,
      borderRadius: BorderRadius.circular(radius),
      border: Border.all(color: borderColor, width: 1.5),
      boxShadow: [
        BoxShadow(
          color: Colors.black.withOpacity(0.2),
          blurRadius: 10,
          offset: const Offset(0, 4),
        )
      ],
    );
  }
}
