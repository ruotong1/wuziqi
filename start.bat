@echo off
chcp 65001 >nul
echo 🎮 五子棋游戏启动脚本
echo ====================
echo.

REM 检查dist目录是否存在
if not exist "dist" (
    echo ❌ 错误：dist目录不存在！
    echo 正在构建项目...
    call npm run build
    if errorlevel 1 (
        echo ❌ 构建失败！
        pause
        exit /b 1
    )
)

REM 进入dist目录
cd dist

echo ✅ 构建文件已准备就绪
echo.
echo 正在启动本地服务器...
echo.

REM 检查是否有Python
where python >nul 2>&1
if %errorlevel% equ 0 (
    echo 使用 Python 启动服务器...
    echo 访问地址: http://localhost:8080/gomoku
    echo.
    echo 按 Ctrl+C 停止服务器
    echo.
    python -m http.server 8080
) else (
    echo ❌ 未找到 Python
    echo.
    echo 请安装 Python 或使用以下方法：
    echo 1. 安装 Node.js 的 serve: npm install -g serve
    echo 2. 然后运行: serve -s . -l 8080
    echo.
    echo 或者使用开发模式：
    echo cd .. ^&^& npm run dev
    echo.
    pause
    exit /b 1
)





