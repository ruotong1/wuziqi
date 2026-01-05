import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../config/api_config.dart';
import 'auth_service.dart';

class VideoService {
  static Future<Map<String, dynamic>> generateChikawaVideo(List<String> keywords) async {
    // 检查baseUrl是否已配置
    if (ApiConfig.baseUrl == 'YOUR_API_BASE_URL' || ApiConfig.baseUrl.isEmpty) {
      throw Exception('API地址未配置，请在 lib/config/api_config.dart 中设置正确的 baseUrl');
    }

    // 检查用户是否已登录
    final isLoggedIn = await AuthService.isLoggedIn();
    if (!isLoggedIn) {
      throw Exception('请先登录后再生成视频');
    }

    // 获取token
    final token = await AuthService.getAccessToken();
    if (token == null || token.isEmpty) {
      throw Exception('登录已过期，请重新登录');
    }

    final url = Uri.parse('${ApiConfig.baseUrl}/api/video/generate');
    final headers = {
      'Authorization': 'Bearer $token',
      'Content-Type': 'application/json',
    };
    
    final body = jsonEncode({
      'keywords': keywords,
      'style': 'chikawa',
      'format': 'mp4',
    });

    try {
      final response = await http.post(
        url,
        headers: headers,
        body: body,
      ).timeout(ApiConfig.requestTimeout);

      if (response.statusCode == 200) {
        return jsonDecode(response.body) as Map<String, dynamic>;
      } else if (response.statusCode == 202) {
        return jsonDecode(response.body) as Map<String, dynamic>;
      } else if (response.statusCode == 404) {
        throw Exception('API接口不存在(404)，请检查：\n1. API地址是否正确\n2. 后端服务是否已启动\n3. 接口路径是否正确');
      } else if (response.statusCode == 401) {
        // Token可能已过期，清除登录状态
        await AuthService.logout();
        throw Exception('登录已过期，请重新登录');
      } else if (response.statusCode == 403) {
        throw Exception('权限不足(403)，请检查您的账户权限');
      } else {
        final errorBody = response.body;
        try {
          final errorJson = jsonDecode(errorBody) as Map<String, dynamic>;
          final errorMsg = errorJson['error']?['message'] ?? errorJson['message'] ?? '未知错误';
          throw Exception('视频生成失败(${response.statusCode}): $errorMsg');
        } catch (_) {
          throw Exception('视频生成失败(${response.statusCode}): ${response.reasonPhrase ?? "未知错误"}');
        }
      }
    } catch (e) {
      if (e.toString().contains('Failed host lookup') || 
          e.toString().contains('Connection refused') ||
          e.toString().contains('Network is unreachable')) {
        throw Exception('无法连接到服务器，请检查：\n1. 网络连接是否正常\n2. API地址是否正确\n3. 后端服务是否已启动');
      } else if (e.toString().contains('TimeoutException') || e.toString().contains('timeout')) {
        throw Exception('请求超时，请稍后重试');
      } else if (e is Exception) {
        rethrow;
      } else {
        throw Exception('发生未知错误: ${e.toString()}');
      }
    }
  }

  static Future<Map<String, dynamic>> checkGenerationStatus(String taskId) async {
    // 获取token
    final token = await AuthService.getAccessToken();
    if (token == null || token.isEmpty) {
      throw Exception('登录已过期，请重新登录');
    }

    final url = Uri.parse('${ApiConfig.baseUrl}/api/video/status/$taskId');
    final headers = {
      'Authorization': 'Bearer $token',
      'Content-Type': 'application/json',
    };

    try {
      final response = await http.get(
        url,
        headers: headers,
      ).timeout(ApiConfig.statusCheckTimeout);

      if (response.statusCode == 200) {
        return jsonDecode(response.body) as Map<String, dynamic>;
      } else {
        throw Exception('查询状态失败: ${response.statusCode}');
      }
    } catch (e) {
      rethrow;
    }
  }
}

