import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:restaurant_pos/main.dart';
import 'package:restaurant_pos/providers/order_provider.dart';

void main() {
  testWidgets('POS smoke test', (WidgetTester tester) async {
    OrderProvider.isTesting = true;
    // Build our app and trigger a frame.
    await tester.pumpWidget(const RestaurantPosApp());

    // Verify that the app mounts and initializes.
    expect(find.byType(MaterialApp), findsOneWidget);
  });
}
