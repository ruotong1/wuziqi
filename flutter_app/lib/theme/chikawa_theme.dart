import 'package:flutter/material.dart';

class ChikawaTheme {
  static const Color chikawaPink = Color(0xFFFFB6C1);
  static const Color chikawaBlue = Color(0xFF87CEEB);
  static const Color chikawaGreen = Color(0xFF98FB98);
  static const Color chikawaYellow = Color(0xFFFFFACD);
  static const Color chikawaPurple = Color(0xFFDDA0DD);

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.light(
        primary: chikawaPink,
        secondary: chikawaBlue,
        surface: Colors.white,
        background: const Color(0xFFFFF8F0),
      ),
      textTheme: const TextTheme(
        displayLarge: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: Colors.black87),
        bodyLarge: TextStyle(fontSize: 16, color: Colors.black87),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: chikawaPink,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(15)),
        filled: true,
        fillColor: Colors.white,
      ),
      cardTheme: CardThemeData(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        elevation: 4,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: IconThemeData(color: Colors.black87),
      ),
    );
  }

  static BoxDecoration get gradientBackground {
    return const BoxDecoration(
      gradient: LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [chikawaPink, chikawaBlue, chikawaGreen],
        stops: [0.0, 0.5, 1.0],
      ),
    );
  }
  
  static BoxDecoration animatedGradientBackground(Animation<double> animation) {
    return BoxDecoration(
      gradient: LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [
          Color.lerp(chikawaPink, chikawaBlue, animation.value)!,
          Color.lerp(chikawaBlue, chikawaGreen, animation.value)!,
          Color.lerp(chikawaGreen, chikawaPink, animation.value)!,
        ],
        stops: const [0.0, 0.5, 1.0],
      ),
    );
  }

  static const double borderRadiusSmall = 10.0;
  static const double borderRadiusMedium = 15.0;
  static const double borderRadiusLarge = 20.0;
}

