# 2026-03-27 问题复盘

> 记录今日开发过程中遇到的问题、异常及解决方案，用于后续避免重复踩坑。

---

## 问题清单

### 1. TypeScript 编译错误：未使用的导入和变量

**现象**：
```
error TS6133: 'useRef' is declared but its value is never read
error TS6133: 'useEffect' is declared but its value is never read
error TS6133: 'thStyle' is declared but its value is never read
```

**原因**：
- 重构代码时遗留了未使用的 import
- 部分组件中提取了样式常量但未使用

**影响**：构建失败，无法部署

**解决**：
- 删除未使用的 import（useRef, useEffect）
- 删除未使用的样式常量（thStyle）
- 使用 `npm run build` 验证通过

**预防措施**：
1. 开发时启用 ESLint 自动检测未使用变量
2. 提交前本地运行 `npm run build` 检查
3. 重构后清理遗留代码

---

### 2. 部署路径错误

**现象**：部署后服务器上文件未更新，用户反馈"没有出现"

**原因**：
```bash
# 错误路径
/var/www/indigenex/admin/

# 正确路径
/var/www/indigenex-website/admin/dist/
```

nginx 配置中配置的 admin 路径是 `/var/www/indigenex-website/admin/dist/`，但首次 rsync 时使用了错误的路径。

**影响**：用户访问的仍是旧版本

**解决**：
```bash
rsync -avz -e "ssh -i ~/.ssh/deploy-key.pem" admin/dist/ \
  root@47.236.193.197:/var/www/indigenex-website/admin/dist/
```

**预防措施**：
1. 部署前检查 nginx 配置中的实际路径
2. 创建部署脚本，路径硬编码，避免手动输入错误
3. 部署后验证文件时间戳：`ls -la /var/www/.../admin/dist/`

---

### 3. SSH 连接超时（后台任务）

**现象**：
```
Read from remote host 47.236.193.197: Operation timed out
client_loop: send disconnect: Broken pipe
```

**原因**：后台任务执行 `pm2 logs` 时使用持续监听模式，导致连接保持时间过长，网络中断。

**影响**：后台任务状态标记为 failed，但实际操作可能已完成

**解决**：
```bash
# 错误（持续监听）
pm2 logs indigenex-backend --lines 50

# 正确（只获取历史日志）
pm2 logs indigenex-backend --lines 50 --nostream
```

**预防措施**：
1. 后台任务使用 `--nostream` 参数避免持续监听
2. 对于需要持续监听的任务，使用本地 bash 而非后台任务
3. 设置 SSH 连接保活参数：`-o ServerAliveInterval=60`

---

### 4. lucide-react 图标不存在

**现象**：
```
error TS2305: Module '"lucide-react"' has no exported member 'Handshake'.
```

**原因**：lucide-react 库中没有 Handshake 图标，使用了错误的图标名称。

**影响**：构建失败

**解决**：
使用替代图标：
```typescript
// 错误
import { Handshake } from 'lucide-react'

// 正确 - 使用 Building2 替代客商管理图标
import { Building2 } from 'lucide-react'
```

**预防措施**：
1. 使用图标前先在 [lucide.dev](https://lucide.dev) 搜索确认存在
2. 准备常用图标对照表，避免随意选用不存在的图标
3. 构建失败时优先检查图标名称拼写

---

## 经验教训总结

### 关于代码质量
- 重构时及时清理遗留代码，避免未使用变量堆积
- 启用严格的 TypeScript 配置，编译前捕获问题
- 保持 import 语句整洁，定期审查

### 关于部署流程
- 部署前必须确认目标路径，与 nginx 配置核对
- 建立标准化部署脚本，减少人工操作
- 部署后执行验证步骤（检查文件、刷新缓存、功能测试）

### 关于图标使用
- lucide-react 并非包含所有常见图标，使用前先验证
- 准备图标备选方案，发现不存在时快速替换
- 保持图标风格一致性（strokeWidth、size 等）

### 关于后台任务
- 理解命令的行为模式（是否持续运行）
- 长时间运行命令避免使用后台任务
- 网络不稳定时增加重试机制和超时控制

---

## 改进建议

1. **添加 ESLint 配置**：强制检查未使用变量，在编码阶段发现问题
2. **创建部署脚本**：`deploy-admin.sh` 封装 rsync 和 nginx 刷新
3. **图标映射表**：建立业务概念到图标名称的映射文档
4. **CI/CD 流程**：GitHub Actions 自动构建检查，阻断问题代码合并

---

记录时间：2026-03-27 21:45
记录人：Claude
