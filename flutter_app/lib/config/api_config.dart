import 'package:shared_preferences/shared_preferences.dart';

class ApiConfig {
  // 后端API地址 - 本地开发环境
  // 如果后端部署在其他地址，请修改为实际地址，例如：
  // static const String baseUrl = 'https://your-api-domain.com';
  static const String baseUrl = 'http://localhost:3000';
  
  // 请在环境变量或配置文件中设置，不要硬编码
  static const String accessKeyId = 'YOUR_ACCESS_KEY_ID';
  static const String secretAccessKey = 'YOUR_SECRET_ACCESS_KEY';
  static const String modelId = 'ep-20241220123456-xxxxx';
  static const Duration requestTimeout = Duration(seconds: 30);
  static const Duration statusCheckTimeout = Duration(seconds: 10);
  static const Duration pollInterval = Duration(seconds: 3);
  static const int maxPollAttempts = 100;

  static Future<Map<String, String>> getAuthHeaders() async {
    // 从SharedPreferences获取用户登录后的token
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('accessToken');
    
    if (token != null && token.isNotEmpty) {
      return {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      };
    }
    
    // 如果没有token，返回空headers（某些接口不需要认证）
    return {
      'Content-Type': 'application/json',
    };
  }

  static bool isConfigValid() {
    return accessKeyId.isNotEmpty && secretAccessKey.isNotEmpty;
  }
}

