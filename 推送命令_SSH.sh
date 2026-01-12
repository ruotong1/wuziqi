#!/bin/bash
# 使用SSH方式推送到GitHub

cd "/Users/xianshu/Desktop/cursor zrt"

echo "配置SSH远程仓库..."
git remote set-url origin git@github.com:ruotong1/wuziqi.git

echo "开始推送..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo "✅ 推送成功！"
else
    echo "❌ 推送失败，请检查："
    echo "1. 是否已将SSH公钥添加到GitHub"
    echo "2. SSH密钥是否已添加到ssh-agent"
    echo "3. 网络连接是否正常"
fi





