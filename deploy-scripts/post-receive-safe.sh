#!/bin/bash

# Indigenex Website Deployment Hook
# 使用 Prisma Migrate 替代 db push，避免数据丢失

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 项目配置
PROJECT_NAME="indigenex-website"
DEPLOY_DIR="/var/www/${PROJECT_NAME}"
BACKUP_DIR="/var/backups/${PROJECT_NAME}"
APP_NAME="indigenex-backend"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  🚀 Indigenex 部署脚本${NC}"
echo -e "${GREEN}========================================${NC}"

while read oldrev newrev refname; do
    branch=$(git rev-parse --symbolic --abbrev-ref $refname)
    echo -e "\n${YELLOW}📦 接收推送: $oldrev → $newrev ($branch)${NC}"

    if [ "$branch" = "main" ]; then
        echo -e "\n${YELLOW}🔄 开始部署到生产环境...${NC}"

        # 1. 更新代码
        echo -e "\n${YELLOW}[1/6] 更新代码...${NC}"
        cd $DEPLOY_DIR || exit 1
        git --git-dir=/var/git/${PROJECT_NAME}.git --work-tree=$DEPLOY_DIR checkout -f main
        echo -e "${GREEN}✓ 代码更新完成${NC}"

        # 2. 备份数据库（保险措施）
        echo -e "\n${YELLOW}[2/6] 备份数据库...${NC}"
        mkdir -p $BACKUP_DIR
        DB_PATH="${DEPLOY_DIR}/backend/prisma/dev.db"
        if [ -f "$DB_PATH" ]; then
            BACKUP_FILE="${BACKUP_DIR}/dev.db.backup.$(date +%Y%m%d_%H%M%S)"
            cp $DB_PATH $BACKUP_FILE
            echo -e "${GREEN}✓ 数据库已备份到: $BACKUP_FILE${NC}"

            # 只保留最近 10 个备份
            ls -t ${BACKUP_DIR}/dev.db.backup.* 2>/dev/null | tail -n +11 | xargs rm -f 2>/dev/null
        else
            echo -e "${YELLOW}⚠ 数据库文件不存在，跳过备份${NC}"
        fi

        # 3. 安装依赖 & 构建前端
        echo -e "\n${YELLOW}[3/6] 构建前端...${NC}"
        cd ${DEPLOY_DIR}/frontend && npm install && npm run build
        echo -e "${GREEN}✓ 前端构建完成${NC}"

        # 4. 安装依赖 & 构建管理后台
        echo -e "\n${YELLOW}[4/6] 构建管理后台...${NC}"
        cd ${DEPLOY_DIR}/admin && npm install && npm run build
        echo -e "${GREEN}✓ 管理后台构建完成${NC}"

        # 5. 安装后端依赖 & 执行数据库迁移
        echo -e "\n${YELLOW}[5/6] 更新后端 & 数据库迁移...${NC}"
        cd ${DEPLOY_DIR}/backend

        # 安装依赖
        npm install

        # 使用 migrate deploy 替代 db push --accept-data-loss
        # migrate deploy 只会应用已有的迁移文件，不会重置数据
        echo -e "${YELLOW}   执行数据库迁移...${NC}"
        npx prisma migrate deploy

        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ 数据库迁移完成${NC}"
        else
            echo -e "${RED}✗ 数据库迁移失败，正在恢复...${NC}"
            # 如果迁移失败，尝试恢复备份
            if [ -f "$BACKUP_FILE" ]; then
                cp $BACKUP_FILE $DB_PATH
                echo -e "${YELLOW}⚠ 数据库已恢复到迁移前状态${NC}"
            fi
            exit 1
        fi

        # 6. 重启后端服务
        echo -e "\n${YELLOW}[6/6] 重启服务...${NC}"
        cd ${DEPLOY_DIR}/backend

        # 检查 PM2 进程是否存在
        if pm2 list | grep -q "$APP_NAME"; then
            pm2 reload $APP_NAME --update-env
            echo -e "${GREEN}✓ 服务已重载${NC}"
        else
            pm2 start server.js --name $APP_NAME
            echo -e "${GREEN}✓ 服务已启动${NC}"
        fi

        # 部署后验证
        echo -e "\n${YELLOW}🔍 部署验证...${NC}"
        sleep 2
        if curl -s http://localhost:5001/api/news > /dev/null; then
            echo -e "${GREEN}✓ API 服务正常运行${NC}"
        else
            echo -e "${RED}✗ API 服务可能异常，请检查${NC}"
        fi

        # 清理旧备份（保留最近 10 个）
        ls -t ${BACKUP_DIR}/dev.db.backup.* 2>/dev/null | tail -n +11 | xargs rm -f 2>/dev/null

        echo -e "\n${GREEN}========================================${NC}"
        echo -e "${GREEN}  ✅ 部署完成！${NC}"
        echo -e "${GREEN}========================================${NC}"
        echo -e "\n📊 状态检查:"
        echo -e "   网站: http://47.236.193.197/"
        echo -e "   API:  http://47.236.193.197/api/news"
        pm2 list | grep "$APP_NAME"

    else
        echo -e "${YELLOW}⏭  分支 $branch 不是 main，跳过部署${NC}"
    fi
done
