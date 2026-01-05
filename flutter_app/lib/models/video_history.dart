class VideoHistory {
  final String id;
  final List<String> keywords;
  final String videoUrl;
  final String? thumbnail;
  final int? duration;
  final DateTime createdAt;
  final String? localPath;

  VideoHistory({
    required this.id,
    required this.keywords,
    required this.videoUrl,
    this.thumbnail,
    this.duration,
    required this.createdAt,
    this.localPath,
  });

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'keywords': keywords,
      'videoUrl': videoUrl,
      'thumbnail': thumbnail,
      'duration': duration,
      'createdAt': createdAt.toIso8601String(),
      'localPath': localPath,
    };
  }

  factory VideoHistory.fromJson(Map<String, dynamic> json) {
    return VideoHistory(
      id: json['id'] as String,
      keywords: List<String>.from(json['keywords'] as List),
      videoUrl: json['videoUrl'] as String,
      thumbnail: json['thumbnail'] as String?,
      duration: json['duration'] as int?,
      createdAt: DateTime.parse(json['createdAt'] as String),
      localPath: json['localPath'] as String?,
    );
  }
}


