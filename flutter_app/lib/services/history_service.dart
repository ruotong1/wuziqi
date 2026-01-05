import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/video_history.dart';
import '../config/api_config.dart';
import 'auth_service.dart';

class HistoryService {
  static const String _key = 'video_history';
  static const int _maxHistory = 50;

  // 从后端API获取历史记录
  static Future<List<VideoHistory>> getHistoryFromServer() async {
    final token = await AuthService.getAccessToken();
    if (token == null || token.isEmpty) {
      return [];
    }

    try {
      final url = Uri.parse('${ApiConfig.baseUrl}/api/video/history?page=1&pageSize=100');
      final response = await http.get(
        url,
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body) as Map<String, dynamic>;
        if (data['success'] == true && data['data'] != null) {
          final historyData = data['data'] as Map<String, dynamic>;
          final historyList = historyData['history'] as List;
          
          return historyList.map((item) {
            final historyItem = item as Map<String, dynamic>;
            return VideoHistory(
              id: historyItem['historyId'] as String? ?? 
                  historyItem['taskId'] as String? ?? 
                  historyItem['videoId'] as String? ?? 
                  '',
              keywords: List<String>.from(historyItem['keywords'] as List),
              videoUrl: historyItem['videoUrl'] as String,
              createdAt: DateTime.parse(historyItem['createdAt'] as String),
            );
          }).toList();
        }
      }
    } catch (e) {
      print('获取服务器历史记录失败: $e');
    }
    return [];
  }

  // 获取历史记录（优先从服务器获取）
  static Future<List<VideoHistory>> getHistory() async {
    // 先尝试从服务器获取
    final serverHistory = await getHistoryFromServer();
    if (serverHistory.isNotEmpty) {
      // 同步到本地
      final prefs = await SharedPreferences.getInstance();
      final jsonList = serverHistory.map((h) => h.toJson()).toList();
      await prefs.setString(_key, jsonEncode(jsonList));
      return serverHistory;
    }
    
    // 如果服务器没有，从本地获取
    final prefs = await SharedPreferences.getInstance();
    final jsonString = prefs.getString(_key);
    if (jsonString == null) return [];
    final jsonList = jsonDecode(jsonString) as List;
    return jsonList.map((json) => VideoHistory.fromJson(json as Map<String, dynamic>)).toList();
  }

  static Future<void> addHistory(VideoHistory history) async {
    // 后端会自动保存历史记录，这里只保存到本地作为缓存
    final prefs = await SharedPreferences.getInstance();
    final histories = await getHistory();
    
    // 检查是否已存在（避免重复）
    if (histories.any((h) => h.id == history.id)) {
      return;
    }
    
    histories.insert(0, history);
    if (histories.length > _maxHistory) {
      histories.removeRange(_maxHistory, histories.length);
    }
    final jsonList = histories.map((h) => h.toJson()).toList();
    await prefs.setString(_key, jsonEncode(jsonList));
  }

  static Future<void> deleteHistory(String id) async {
    // 尝试从服务器删除
    final token = await AuthService.getAccessToken();
    if (token != null && token.isNotEmpty) {
      try {
        final url = Uri.parse('${ApiConfig.baseUrl}/api/video/history/$id');
        await http.delete(
          url,
          headers: {
            'Authorization': 'Bearer $token',
            'Content-Type': 'application/json',
          },
        ).timeout(const Duration(seconds: 10));
      } catch (e) {
        print('删除服务器历史记录失败: $e');
      }
    }
    
    // 从本地删除
    final histories = await getHistory();
    histories.removeWhere((h) => h.id == id);
    final prefs = await SharedPreferences.getInstance();
    final jsonList = histories.map((h) => h.toJson()).toList();
    await prefs.setString(_key, jsonEncode(jsonList));
  }

  static Future<void> clearHistory() async {
    // 尝试清空服务器历史记录
    final token = await AuthService.getAccessToken();
    if (token != null && token.isNotEmpty) {
      try {
        final url = Uri.parse('${ApiConfig.baseUrl}/api/video/history/clear');
        await http.delete(
          url,
          headers: {
            'Authorization': 'Bearer $token',
            'Content-Type': 'application/json',
          },
        ).timeout(const Duration(seconds: 10));
      } catch (e) {
        print('清空服务器历史记录失败: $e');
      }
    }
    
    // 清空本地
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_key);
  }
}

