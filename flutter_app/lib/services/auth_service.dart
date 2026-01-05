import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../config/api_config.dart';

class AuthService {
  static const String _tokenKey = 'accessToken';
  static const String _refreshTokenKey = 'refreshToken';
  static const String _usernameKey = 'username';
  static const String _isLoggedInKey = 'isLoggedIn';

  // 登录
  static Future<Map<String, dynamic>> login(String username, String password) async {
    final url = Uri.parse('${ApiConfig.baseUrl}/api/auth/login');
    
    final body = jsonEncode({
      'username': username,
      'password': password,
    });

    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: body,
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body) as Map<String, dynamic>;
        if (data['success'] == true && data['data'] != null) {
          final userData = data['data'] as Map<String, dynamic>;
          final accessToken = userData['accessToken'] as String;
          final refreshToken = userData['refreshToken'] as String;
          
          // 保存token
          final prefs = await SharedPreferences.getInstance();
          await prefs.setString(_tokenKey, accessToken);
          await prefs.setString(_refreshTokenKey, refreshToken);
          await prefs.setString(_usernameKey, username);
          await prefs.setBool(_isLoggedInKey, true);
          
          return data;
        }
        throw Exception(data['error']?['message'] ?? '登录失败');
      } else if (response.statusCode == 401) {
        final errorData = jsonDecode(response.body) as Map<String, dynamic>;
        final errorMsg = errorData['error']?['message'] ?? '用户名或密码错误';
        throw Exception(errorMsg);
      } else {
        final errorData = jsonDecode(response.body) as Map<String, dynamic>;
        throw Exception(errorData['error']?['message'] ?? '登录失败');
      }
    } catch (e) {
      if (e.toString().contains('Failed host lookup') || 
          e.toString().contains('Connection refused')) {
        throw Exception('无法连接到服务器，请检查后端服务是否已启动');
      }
      rethrow;
    }
  }

  // 注册
  static Future<Map<String, dynamic>> register(String username, String password, {String? email}) async {
    final url = Uri.parse('${ApiConfig.baseUrl}/api/auth/register');
    
    final body = jsonEncode({
      'username': username,
      'password': password,
      if (email != null) 'email': email,
    });

    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: body,
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 201 || response.statusCode == 200) {
        final data = jsonDecode(response.body) as Map<String, dynamic>;
        if (data['success'] == true && data['data'] != null) {
          final userData = data['data'] as Map<String, dynamic>;
          final accessToken = userData['accessToken'] as String;
          final refreshToken = userData['refreshToken'] as String;
          
          // 保存token
          final prefs = await SharedPreferences.getInstance();
          await prefs.setString(_tokenKey, accessToken);
          await prefs.setString(_refreshTokenKey, refreshToken);
          await prefs.setString(_usernameKey, username);
          await prefs.setBool(_isLoggedInKey, true);
          
          return data;
        }
        throw Exception(data['error']?['message'] ?? '注册失败');
      } else {
        final errorData = jsonDecode(response.body) as Map<String, dynamic>;
        throw Exception(errorData['error']?['message'] ?? '注册失败');
      }
    } catch (e) {
      rethrow;
    }
  }

  // 获取当前token
  static Future<String?> getAccessToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_tokenKey);
  }

  // 登出
  static Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
    await prefs.remove(_refreshTokenKey);
    await prefs.remove(_usernameKey);
    await prefs.setBool(_isLoggedInKey, false);
  }

  // 检查是否已登录
  static Future<bool> isLoggedIn() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool(_isLoggedInKey) ?? false;
  }
}

