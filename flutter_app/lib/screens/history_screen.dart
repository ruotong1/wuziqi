import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../services/history_service.dart';
import '../models/video_history.dart';
import '../theme/chikawa_theme.dart';
import 'video_player_screen.dart';

class HistoryScreen extends StatefulWidget {
  const HistoryScreen({super.key});

  @override
  State<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen> {
  List<VideoHistory> _histories = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadHistory();
  }

  Future<void> _loadHistory() async {
    setState(() => _isLoading = true);
    // 从服务器获取最新历史记录
    final histories = await HistoryService.getHistoryFromServer();
    setState(() {
      _histories = histories;
      _isLoading = false;
    });
  }

  Future<void> _deleteHistory(String id) async {
    await HistoryService.deleteHistory(id);
    _loadHistory();
  }

  Future<void> _clearAll() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('确认清空'),
        content: const Text('确定要清空所有历史记录吗？'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('取消'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('确定'),
          ),
        ],
      ),
    );
    if (confirmed == true) {
      await HistoryService.clearHistory();
      _loadHistory();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('历史记录'),
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
          if (_histories.isNotEmpty)
            IconButton(
              icon: const Icon(Icons.delete_outline),
              tooltip: '清空全部',
              onPressed: _clearAll,
            ),
        ],
      ),
      body: Container(
        decoration: ChikawaTheme.gradientBackground,
        child: _isLoading
            ? const Center(
                child: CircularProgressIndicator(
                  valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                ),
              )
            : _histories.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Text('🐹', style: TextStyle(fontSize: 80)),
                        const SizedBox(height: 16),
                        const Text(
                          '暂无历史记录',
                          style: TextStyle(
                            fontSize: 18,
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          '生成的视频将显示在这里',
                          style: TextStyle(
                            fontSize: 14,
                            color: Colors.white70,
                          ),
                        ),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _histories.length,
                    itemBuilder: (context, index) {
                      final history = _histories[index];
                      return Dismissible(
                        key: Key(history.id),
                        direction: DismissDirection.endToStart,
                        onDismissed: (_) => _deleteHistory(history.id),
                        background: Container(
                          alignment: Alignment.centerRight,
                          padding: const EdgeInsets.only(right: 20),
                          decoration: BoxDecoration(
                            color: Colors.red,
                            borderRadius: BorderRadius.circular(ChikawaTheme.borderRadiusMedium),
                          ),
                          child: const Icon(Icons.delete, color: Colors.white, size: 28),
                        ),
                        child: Card(
                          elevation: 4,
                          margin: const EdgeInsets.only(bottom: 12),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(ChikawaTheme.borderRadiusMedium),
                          ),
                          child: ListTile(
                            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                            leading: Container(
                              width: 50,
                              height: 50,
                              decoration: BoxDecoration(
                                color: ChikawaTheme.chikawaPink.withOpacity(0.2),
                                borderRadius: BorderRadius.circular(ChikawaTheme.borderRadiusSmall),
                              ),
                              child: const Icon(
                                Icons.video_library,
                                color: ChikawaTheme.chikawaPink,
                              ),
                            ),
                            title: Text(
                              history.keywords.join(', '),
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
                              ),
                            ),
                            subtitle: Padding(
                              padding: const EdgeInsets.only(top: 4),
                              child: Text(
                                DateFormat('yyyy-MM-dd HH:mm').format(history.createdAt),
                                style: TextStyle(
                                  fontSize: 12,
                                  color: Colors.grey.shade600,
                                ),
                              ),
                            ),
                            trailing: Container(
                              decoration: BoxDecoration(
                                color: ChikawaTheme.chikawaBlue,
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: IconButton(
                                icon: const Icon(Icons.play_arrow, color: Colors.white),
                                onPressed: () {
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder: (_) => VideoPlayerScreen(videoUrl: history.videoUrl),
                                    ),
                                  );
                                },
                              ),
                            ),
                          ),
                        ),
                      );
                    },
                  ),
      ),
    );
  }
}

