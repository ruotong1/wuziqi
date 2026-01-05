import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../theme/chikawa_theme.dart';
import '../services/video_service.dart';
import '../services/history_service.dart';
import '../services/auth_service.dart';
import '../models/video_history.dart';
import '../config/api_config.dart';
import 'history_screen.dart';
import 'video_player_screen.dart';
import 'login_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> with TickerProviderStateMixin {
  final _keyword1Controller = TextEditingController();
  final _keyword2Controller = TextEditingController();
  final _keyword3Controller = TextEditingController();
  bool _isGenerating = false;
  
  late AnimationController _bounceController;
  late AnimationController _fadeController;
  late AnimationController _scaleController;
  late AnimationController _gradientController;
  late Animation<double> _bounceAnimation;
  late Animation<double> _fadeAnimation;
  late Animation<double> _scaleAnimation;
  late Animation<double> _gradientAnimation;

  @override
  void initState() {
    super.initState();
    
    // 跳动动画
    _bounceController = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    )..repeat(reverse: true);
    
    _bounceAnimation = Tween<double>(begin: 0.0, end: 10.0).animate(
      CurvedAnimation(parent: _bounceController, curve: Curves.easeInOut),
    );
    
    // 淡入动画
    _fadeController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );
    
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _fadeController, curve: Curves.easeIn),
    );
    
    // 缩放动画
    _scaleController = AnimationController(
      duration: const Duration(milliseconds: 600),
      vsync: this,
    );
    
    _scaleAnimation = Tween<double>(begin: 0.8, end: 1.0).animate(
      CurvedAnimation(parent: _scaleController, curve: Curves.easeOut),
    );
    
    // 渐变背景动画
    _gradientController = AnimationController(
      duration: const Duration(seconds: 3),
      vsync: this,
    )..repeat();
    
    _gradientAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _gradientController, curve: Curves.linear),
    );
    
    // 启动动画
    _fadeController.forward();
    _scaleController.forward();
  }

  @override
  void dispose() {
    _bounceController.dispose();
    _fadeController.dispose();
    _scaleController.dispose();
    _gradientController.dispose();
    _keyword1Controller.dispose();
    _keyword2Controller.dispose();
    _keyword3Controller.dispose();
    super.dispose();
  }

  Future<void> _generateVideo() async {
    final keywords = [
      _keyword1Controller.text.trim(),
      _keyword2Controller.text.trim(),
      _keyword3Controller.text.trim(),
    ].where((k) => k.isNotEmpty).toList();

    if (keywords.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('请输入至少一个关键字')),
      );
      return;
    }

    setState(() => _isGenerating = true);

    try {
      final response = await VideoService.generateChikawaVideo(keywords);
      
      if (response['success'] == true && response['data'] != null) {
        final data = response['data'] as Map<String, dynamic>;
        
        if (data['videoUrl'] != null) {
          final history = VideoHistory(
            id: DateTime.now().millisecondsSinceEpoch.toString(),
            keywords: keywords,
            videoUrl: data['videoUrl'] as String,
            thumbnail: data['thumbnail'] as String?,
            duration: data['duration'] as int?,
            createdAt: DateTime.now(),
          );
          await HistoryService.addHistory(history);
          
          if (mounted) {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => VideoPlayerScreen(videoUrl: data['videoUrl'] as String),
              ),
            );
          }
        } else if (data['taskId'] != null) {
          // 异步任务，启动轮询检查
          final taskId = data['taskId'] as String;
          _pollTaskStatus(taskId, keywords);
        }
      }
    } catch (e) {
      if (mounted) {
        final errorMessage = e.toString().replaceFirst('Exception: ', '');
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              errorMessage,
              style: const TextStyle(fontSize: 14),
            ),
            duration: const Duration(seconds: 5),
            backgroundColor: Colors.red,
            action: SnackBarAction(
              label: '确定',
              textColor: Colors.white,
              onPressed: () {},
            ),
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isGenerating = false);
      }
    }
  }

  // 轮询检查任务状态
  Future<void> _pollTaskStatus(String taskId, List<String> keywords) async {
    int attempts = 0;
    const maxAttempts = 60; // 最多轮询60次（约3分钟）
    
    // 显示轮询开始提示
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('视频生成中，请稍候...'),
          duration: Duration(seconds: 2),
        ),
      );
    }
    
    while (attempts < maxAttempts && mounted) {
      await Future.delayed(ApiConfig.pollInterval);
      attempts++;
      
      try {
        final statusResponse = await VideoService.checkGenerationStatus(taskId);
        
        if (statusResponse['success'] == true && statusResponse['data'] != null) {
          final statusData = statusResponse['data'] as Map<String, dynamic>;
          final status = statusData['status'] as String;
          
          if (status == 'completed' && statusData['videoUrl'] != null) {
            // 任务完成，后端已自动添加到历史记录，这里只更新本地缓存
            final history = VideoHistory(
              id: statusData['taskId'] as String? ?? taskId,
              keywords: keywords,
              videoUrl: statusData['videoUrl'] as String,
              thumbnail: statusData['thumbnail'] as String?,
              duration: statusData['duration'] as int?,
              createdAt: DateTime.parse(statusData['createdAt'] as String),
            );
            await HistoryService.addHistory(history);
            
            // 刷新历史记录列表（从服务器获取最新数据）
            if (mounted) {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('✅ 视频生成完成！已添加到历史记录'),
                  backgroundColor: Colors.green,
                  duration: Duration(seconds: 3),
                ),
              );
            }
            return;
          } else if (status == 'failed') {
            if (mounted) {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('视频生成失败'),
                  backgroundColor: Colors.red,
                ),
              );
            }
            return;
          }
          // 继续轮询，显示进度
          if (mounted && attempts % 5 == 0) {
            final progress = statusData['progress'] as int? ?? 0;
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('生成进度: $progress%'),
                duration: const Duration(seconds: 1),
              ),
            );
          }
        }
      } catch (e) {
        // 轮询出错，继续尝试
        print('轮询任务状态出错: $e');
        if (attempts >= maxAttempts) {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('任务状态查询超时，请稍后手动查看历史记录'),
                backgroundColor: Colors.orange,
              ),
            );
          }
          return;
        }
      }
    }
    
    if (mounted && attempts >= maxAttempts) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('任务处理时间较长，请稍后查看历史记录'),
          backgroundColor: Colors.orange,
        ),
      );
    }
  }

  Future<void> _logout() async {
    await AuthService.logout();
    if (mounted) {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const LoginScreen()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Chikawa视频生成器'),
        actions: [
          IconButton(
            icon: const Icon(Icons.history),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const HistoryScreen()),
              );
            },
          ),
          PopupMenuButton<String>(
            icon: const Icon(Icons.more_vert),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(ChikawaTheme.borderRadiusMedium),
            ),
            itemBuilder: (context) => [
              PopupMenuItem<String>(
                value: 'logout',
                child: Row(
                  children: [
                    Icon(Icons.logout, color: Colors.red.shade400),
                    const SizedBox(width: 12),
                    const Text('退出登录'),
                  ],
                ),
              ),
            ],
            onSelected: (value) {
              if (value == 'logout') {
                showDialog(
                  context: context,
                  builder: (context) => AlertDialog(
                    title: const Text('确认退出'),
                    content: const Text('确定要退出登录吗？'),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(ChikawaTheme.borderRadiusMedium),
                    ),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.pop(context),
                        child: const Text('取消'),
                      ),
                      TextButton(
                        onPressed: () {
                          Navigator.pop(context);
                          _logout();
                        },
                        style: TextButton.styleFrom(foregroundColor: Colors.red),
                        child: const Text('退出'),
                      ),
                    ],
                  ),
                );
              }
            },
          ),
        ],
      ),
      body: AnimatedBuilder(
        animation: _gradientAnimation,
        builder: (context, child) {
          return Container(
            decoration: ChikawaTheme.animatedGradientBackground(_gradientAnimation),
            child: SafeArea(
              child: FadeTransition(
                opacity: _fadeAnimation,
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
                  child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  const SizedBox(height: 20),
                  // 跳动的Chikawa图标
                  AnimatedBuilder(
                    animation: _bounceAnimation,
                    builder: (context, child) {
                      return Transform.translate(
                        offset: Offset(0, _bounceAnimation.value),
                        child: child,
                      );
                    },
                    child: const Text('🐹', style: TextStyle(fontSize: 80)),
                  ),
                  const SizedBox(height: 16),
                  // 淡入的标题
                  FadeTransition(
                    opacity: _fadeAnimation,
                    child: const Text(
                      'Chikawa视频生成器',
                      style: TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  FadeTransition(
                    opacity: _fadeAnimation,
                    child: const Text(
                      '输入1-3个关键字，生成可爱的Chikawa风格视频',
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.white70,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
                  const SizedBox(height: 32),
                  // 缩放动画的输入卡片
                  ScaleTransition(
                    scale: _scaleAnimation,
                    child: Card(
                      elevation: 8,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(ChikawaTheme.borderRadiusLarge),
                      ),
                      child: Padding(
                        padding: const EdgeInsets.all(24),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              '输入关键字',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 20),
                            TextField(
                              controller: _keyword1Controller,
                              decoration: InputDecoration(
                                labelText: '关键字1 *',
                                hintText: '例如：可爱',
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(ChikawaTheme.borderRadiusSmall),
                                ),
                                filled: true,
                                fillColor: Colors.grey.shade50,
                              ),
                            ),
                            const SizedBox(height: 16),
                            TextField(
                              controller: _keyword2Controller,
                              decoration: InputDecoration(
                                labelText: '关键字2（可选）',
                                hintText: '例如：粉色',
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(ChikawaTheme.borderRadiusSmall),
                                ),
                                filled: true,
                                fillColor: Colors.grey.shade50,
                              ),
                            ),
                            const SizedBox(height: 16),
                            TextField(
                              controller: _keyword3Controller,
                              decoration: InputDecoration(
                                labelText: '关键字3（可选）',
                                hintText: '例如：猫咪',
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(ChikawaTheme.borderRadiusSmall),
                                ),
                                filled: true,
                                fillColor: Colors.grey.shade50,
                              ),
                            ),
                            const SizedBox(height: 24),
                            _buildAnimatedButton(),
                          ],
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  // 淡入的使用提示卡片
                  FadeTransition(
                    opacity: _fadeAnimation,
                    child: Card(
                      elevation: 4,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(ChikawaTheme.borderRadiusMedium),
                      ),
                      child: Padding(
                        padding: const EdgeInsets.all(20),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Icon(Icons.info_outline, color: ChikawaTheme.chikawaBlue),
                                const SizedBox(width: 8),
                                const Text(
                                  '使用提示',
                                  style: TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            _buildTipItem('• 至少输入1个关键字，最多3个关键字'),
                            _buildTipItem('• 关键字越具体，生成的视频越符合预期'),
                            _buildTipItem('• 生成完成后可在历史记录中查看'),
                            _buildTipItem('• 支持保存和分享生成的视频'),
                          ],
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 40),
                  ],
                ),
              ),
            ),
          ),
          );
        },
      ),
    );
  }

  Widget _buildAnimatedButton() {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      width: double.infinity,
      height: 50,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(ChikawaTheme.borderRadiusMedium),
        gradient: LinearGradient(
          colors: _isGenerating
              ? [ChikawaTheme.chikawaPink.withOpacity(0.6), ChikawaTheme.chikawaBlue.withOpacity(0.6)]
              : [ChikawaTheme.chikawaPink, ChikawaTheme.chikawaBlue],
        ),
        boxShadow: _isGenerating
            ? []
            : [
                BoxShadow(
                  color: ChikawaTheme.chikawaPink.withOpacity(0.4),
                  blurRadius: 8,
                  offset: const Offset(0, 4),
                ),
              ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: _isGenerating ? null : _generateVideo,
          borderRadius: BorderRadius.circular(ChikawaTheme.borderRadiusMedium),
          child: Center(
            child: _isGenerating
                ? const SizedBox(
                    height: 20,
                    width: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                    ),
                  )
                : const Text(
                    '生成视频',
                    style: TextStyle(
                      fontSize: 16,
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
          ),
        ),
      ),
    );
  }

  Widget _buildTipItem(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Icon(Icons.circle, size: 6, color: ChikawaTheme.chikawaPink),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              text,
              style: const TextStyle(fontSize: 14, color: Colors.black87),
            ),
          ),
        ],
      ),
    );
  }
}

