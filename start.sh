#!/bin/bash

# 五子棋游戏启动脚本

echo "🎮 五子棋游戏启动脚本"
echo "===================="
echo ""

# 检查dist目录是否存在
if [ ! -d "dist" ]; then
    echo "❌ 错误：dist目录不存在！"
    echo "正在构建项目..."
    npm run build
    if [ $? -ne 0 ]; then
        echo "❌ 构建失败！"
        exit 1
    fi
fi

# 进入dist目录
cd dist

echo "✅ 构建文件已准备就绪"
echo ""
echo "正在启动本地服务器..."
echo ""

# 检查是否有Python
if command -v python3 &> /dev/null; then
    echo "使用 Python 3 启动服务器..."
    echo "访问地址: http://localhost:8080/gomoku"
    echo ""
    echo "按 Ctrl+C 停止服务器"
    echo ""
    python3 -m http.server 8080
elif command -v python &> /dev/null; then
    echo "使用 Python 2 启动服务器..."
    echo "访问地址: http://localhost:8080/gomoku"
    echo ""
    echo "按 Ctrl+C 停止服务器"
    echo ""
    python -m SimpleHTTPServer 8080
else
    echo "❌ 未找到 Python"
    echo ""
    echo "请安装 Python 或使用以下方法："
    echo "1. 安装 Node.js 的 serve: npm install -g serve"
    echo "2. 然后运行: serve -s . -l 8080"
    echo ""
    echo "或者使用开发模式："
    echo "cd .. && npm run dev"
    exit 1
fi





