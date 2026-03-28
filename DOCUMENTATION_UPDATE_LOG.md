# 项目文档更新总结

> 2026-03-27 数据库架构变更文档同步记录

## 变更背景

项目数据库从 SQLite 迁移至 MySQL 8.0 (Docker)，需要同步更新所有项目文档中的数据库配置信息。

## 已更新文档

### 1. README.md
**变更内容:**
- ✅ 技术栈: SQLite → MySQL 8.0 (Docker)
- ✅ 快速开始 - 数据库设置: 添加 Docker MySQL 和 SQLite 两种方式
- ✅ 部署到阿里云 - 环境要求: PostgreSQL 14+ → MySQL 8.0 (Docker)
- ✅ 部署步骤 - 服务器准备: 移除 PostgreSQL 安装，添加 Docker 安装
- ✅ 部署步骤 - 数据库配置: 添加完整的 MySQL Docker 配置脚本

### 2. DEPLOYMENT_GUIDE.md
**变更内容:**
- ✅ 技术栈: SQLite → MySQL 8.0 (Docker)
- ✅ 后端 .env 配置: `DATABASE_URL="file:./dev.db"` → `DATABASE_URL="mysql://root:password@localhost:3306/indigenex"`
- ✅ Prisma Schema: `provider = "sqlite"` → `provider = "mysql"`
- ✅ 运维命令 - 数据库备份: SQLite cp 命令 → MySQL Docker mysqldump
- ✅ 附录文件结构: 更新 schema.prisma 说明和数据库文件描述

### 3. PRODUCTION_DEPLOYMENT.md
**变更内容:**
- ✅ 后端环境变量: SQLite 文件路径 → MySQL 连接字符串
- ✅ 数据库备份脚本: SQLite 文件复制 → MySQL Docker mysqldump
- ✅ 故障排查 - 数据库问题: sqlite3 命令 → docker exec mysql 命令
- ✅ 故障排查 - 权限问题: 移除 SQLite 文件权限相关内容

### 4. MEMORY.md
**状态:** 已在 2026-03-27 数据库分离完成时更新，无需修改

## 文档一致性验证

| 检查项 | README | DEPLOYMENT_GUIDE | PRODUCTION_DEPLOYMENT | MEMORY |
|--------|--------|------------------|----------------------|--------|
| 技术栈标注 | MySQL 8.0 (Docker) | MySQL 8.0 (Docker) | - | MySQL(Docker) |
| 数据库连接URL | mysql:// | mysql:// | mysql:// | mysql:// |
| Prisma Provider | mysql | mysql | - | mysql |
| 备份方式 | Docker mysqldump | Docker mysqldump | Docker mysqldump | Docker mysqldump |
| Docker 容器名 | indigenex-mysql | - | indigenex-mysql | indigenex-mysql |

## 关键配置参考

### 环境变量 .env
```bash
# 本地开发 (SQLite)
DATABASE_URL="file:./dev.db"

# 生产环境 (MySQL Docker)
DATABASE_URL="mysql://root:your_password@localhost:3306/indigenex"
```

### Prisma Schema
```prisma
datasource db {
  provider = "mysql"  // 或 "sqlite" 用于本地开发
  url      = env("DATABASE_URL")
}
```

### Docker Compose
```yaml
services:
  mysql:
    image: mysql:8.0
    container_name: indigenex-mysql
    environment:
      MYSQL_ROOT_PASSWORD: your_secure_password
      MYSQL_DATABASE: indigenex
    ports:
      - "127.0.0.1:3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
```

### 备份命令
```bash
# MySQL Docker 备份
docker exec indigenex-mysql mysqldump -u root -p'password' indigenex > backup_$(date +%Y%m%d).sql

# SQLite 备份 (本地开发)
cp prisma/dev.db backup_$(date +%Y%m%d).db
```

## 注意事项

1. **本地开发**: 仍可使用 SQLite，无需安装 MySQL
2. **生产部署**: 必须使用 MySQL Docker，已配置自动备份
3. **Prisma Migrate**: 切换数据库类型时需要重新生成迁移文件
4. **数据迁移**: SQLite → MySQL 需要使用 prisma db pull 或脚本导入

## 后续维护

- 所有文档已同步至最新数据库架构
- 新增功能开发时注意文档同步更新
- 定期备份数据（已配置自动备份每日凌晨 3:00）

---

**更新时间**: 2026-03-27
**更新者**: Claude
**版本**: v2.0 (MySQL Docker 架构)
