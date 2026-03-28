# Indigenex 对外 API 接口文档

> 版本: v1.0
> 更新日期: 2026-03-27
> 适用对象: Openclaw 系统对接

---

## 基本信息

| 项目 | 说明 |
|------|------|
| 基础 URL | `http://47.236.193.197/api/v1` |
| 认证方式 | API Key (Header: `X-API-Key`) |
| 数据格式 | JSON |
| 编码 | UTF-8 |

---

## 认证说明

所有接口都需要在请求头中携带 API Key：

```http
X-API-Key: your_api_key_here
```

**响应格式**:
```json
{
  "success": true|false,
  "message": "操作结果描述",
  "data": { ... }
}
```

---

## 接口列表

### 1. 运价查询

#### 1.1 获取运价列表

```http
GET /freight-rates
```

**请求参数** (Query):

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | integer | 否 | 页码，默认 1 |
| limit | integer | 否 | 每页条数，默认 20，最大 100 |
| originPort | string | 否 | 起运港代码（模糊匹配） |
| destinationPort | string | 否 | 目的港代码（模糊匹配） |
| carrier | string | 否 | 船公司名称（模糊匹配） |
| transportMode | string | 否 | 运输方式 |

**响应示例**:
```json
{
  "success": true,
  "data": {
    "rates": [
      {
        "id": "uuid-string",
        "route": "远东-欧洲航线",
        "originPort": "SHANGHAI",
        "originPortEn": "Shanghai",
        "destinationPort": "HAMBURG",
        "destinationPortEn": "Hamburg",
        "viaPort": "SINGAPORE",
        "viaPortEn": "Singapore",
        "portArea": "洋山港区",
        "validFrom": "2026-03-01T00:00:00.000Z",
        "validTo": "2026-03-31T23:59:59.000Z",
        "validityType": "LONG",
        "isRecommended": true,
        "price20GP": 1200.00,
        "price40GP": 2100.00,
        "price40HQ": 2200.00,
        "price45HQ": null,
        "currency": "USD",
        "cost20GP": 1100.00,
        "cost40GP": 2000.00,
        "cost40HQ": 2100.00,
        "cost45HQ": null,
        "isAllIn": false,
        "carrier": "MAERSK",
        "carrierLogo": "https://...",
        "transitTime": 28,
        "schedule": "周一/三/五",
        "routeCode": "AE1",
        "vesselName": "MAERSK EINDHOVEN",
        "voyage": "261E",
        "sailingDate": "2026-03-28T00:00:00.000Z",
        "estimatedDeparture": "2026-03-28T18:00:00.000Z",
        "bookingAgent": "上海代理",
        "bookingLink": "https://...",
        "spaceStatus": "AVAILABLE",
        "docCutoffDay": "周四",
        "docCutoffTime": "12:00",
        "billOfLadingType": "正本提单",
        "shippingTerms": "CY-CY",
        "deliveryGuide": "凭正本提单放货",
        "surcharges": { "THC": 750, "DOC": 450 },
        "weightLimit": "20GP限重21吨",
        "remarks": "旺季附加费另计",
        "priceTrend": "UP",
        "contactInfo": "联系人：张三 电话：13800138000",
        "receiptGuide": "提前2天预约",
        "status": "ACTIVE",
        "importBatchId": null,
        "createdBy": "admin",
        "createdAt": "2026-03-01T08:00:00.000Z",
        "updatedAt": "2026-03-27T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

---

#### 1.2 获取运价详情

```http
GET /freight-rates/{id}
```

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | 运价记录 UUID |

**响应示例**: 同列表项数据结构

---

#### 1.3 创建运价（支持批量）

```http
POST /freight-rates
```

**请求体** (JSON):

**单条创建**:
```json
{
  "route": "远东-欧洲航线",
  "originPort": "SHANGHAI",
  "originPortEn": "Shanghai",
  "destinationPort": "HAMBURG",
  "destinationPortEn": "Hamburg",
  "viaPort": "SINGAPORE",
  "viaPortEn": "Singapore",
  "portArea": "洋山港区",
  "validFrom": "2026-03-01",
  "validTo": "2026-03-31",
  "validityType": "LONG",
  "isRecommended": true,
  "price20GP": 1200,
  "price40GP": 2100,
  "price40HQ": 2200,
  "price45HQ": null,
  "currency": "USD",
  "cost20GP": 1100,
  "cost40GP": 2000,
  "cost40HQ": 2100,
  "isAllIn": false,
  "carrier": "MAERSK",
  "transitTime": 28,
  "schedule": "周一/三/五",
  "routeCode": "AE1",
  "vesselName": "MAERSK EINDHOVEN",
  "voyage": "261E",
  "sailingDate": "2026-03-28",
  "estimatedDeparture": "2026-03-28T18:00:00Z",
  "spaceStatus": "AVAILABLE",
  "docCutoffDay": "周四",
  "docCutoffTime": "12:00",
  "billOfLadingType": "正本提单",
  "shippingTerms": "CY-CY",
  "surcharges": { "THC": 750, "DOC": 450 },
  "weightLimit": "20GP限重21吨",
  "remarks": "旺季附加费另计"
}
```

**批量创建**:
```json
[
  { /* 运价对象1 */ },
  { /* 运价对象2 */ },
  ...
]
```

> **注意**: 单次批量最多支持 10,000 条记录

**字段说明**:

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| route | string | 否 | 航线名称 |
| originPort | string | **是** | 起运港（英文代码） |
| destinationPort | string | **是** | 目的港（英文代码） |
| viaPort | string | 否 | 中转港 |
| validFrom | date | 否 | 有效期开始（ISO 8601），默认今天 |
| validTo | date | 否 | 有效期结束，默认 30 天后 |
| price20GP | number | 否 | 20'GP 价格 |
| price40GP | number | 否 | 40'GP 价格 |
| price40HQ | number | 否 | 40'HQ 价格 |
| price45HQ | number | 否 | 45'HQ 价格 |
| currency | string | 否 | 币种，默认 USD |
| carrier | string | 否 | 船公司 |
| transitTime | integer | 否 | 航程天数 |
| spaceStatus | string | 否 | 舱位状态：AVAILABLE/LIMITED/FULL/SUSPENDED |

**响应示例**:
```json
{
  "success": true,
  "message": "创建完成：成功 100 条，失败 0 条",
  "data": {
    "total": 100,
    "success": 100,
    "failed": 0,
    "rates": [ { ... } ],
    "errors": []
  }
}
```

---

#### 1.4 更新运价

```http
PUT /freight-rates/{id}
```

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | 运价记录 UUID |

**请求体**: 同创建运价（只传需要更新的字段）

**响应示例**:
```json
{
  "success": true,
  "message": "运价更新成功",
  "data": {
    "rate": { ... }
  }
}
```

---

#### 1.5 删除运价

```http
DELETE /freight-rates/{id}
```

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | 运价记录 UUID |

**响应示例**:
```json
{
  "success": true,
  "message": "运价删除成功"
}
```

---

## 数据字典

### 运价状态 (status)

| 值 | 说明 |
|----|------|
| ACTIVE | 有效 |
| INACTIVE | 无效 |
| EXPIRED | 已过期 |

### 有效期类型 (validityType)

| 值 | 说明 |
|----|------|
| LONG | 长期 |
| SHORT | 短期 |

### 舱位状态 (spaceStatus)

| 值 | 说明 |
|----|------|
| AVAILABLE | 充足 |
| LIMITED | 紧张 |
| FULL | 爆舱 |
| SUSPENDED | 停航 |

### 运价趋势 (priceTrend)

| 值 | 说明 |
|----|------|
| UP | 上涨 |
| DOWN | 下跌 |
| STABLE | 平稳 |

### 提单类型 (billOfLadingType)

| 值 | 说明 |
|----|------|
| 正本提单 | Original B/L |
| 电放 | Telex Release |
| Sea Waybill | 海运单 |

---

## 错误码说明

| HTTP 状态码 | 说明 | 常见场景 |
|------------|------|----------|
| 200 | 成功 | 请求正常处理 |
| 400 | 请求参数错误 | 缺少必填字段、格式错误 |
| 401 | 未授权 | 缺少 API Key、API Key 无效/禁用/过期 |
| 403 | 权限不足 | 会员账户未激活 |
| 404 | 资源不存在 | 运价记录不存在 |
| 429 | 请求过于频繁 | 触发限流 |
| 500 | 服务器错误 | 系统内部错误 |

**错误响应格式**:
```json
{
  "success": false,
  "message": "错误描述信息"
}
```

---

## 限流说明

- **窗口时间**: 15 分钟
- **最大请求数**: 100 次/窗口
- **超限响应**: HTTP 429

---

## 完整 cURL 示例

### 查询运价列表

```bash
curl -X GET "http://47.236.193.197/api/v1/freight-rates?page=1&limit=20&originPort=SHANGHAI&destinationPort=HAMBURG" \
  -H "X-API-Key: your_api_key_here" \
  -H "Content-Type: application/json"
```

### 创建单条运价

```bash
curl -X POST "http://47.236.193.197/api/v1/freight-rates" \
  -H "X-API-Key: your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "originPort": "SHANGHAI",
    "destinationPort": "HAMBURG",
    "carrier": "MAERSK",
    "price20GP": 1200,
    "price40GP": 2100,
    "price40HQ": 2200,
    "validFrom": "2026-04-01",
    "validTo": "2026-04-30",
    "transitTime": 28
  }'
```

### 批量创建运价

```bash
curl -X POST "http://47.236.193.197/api/v1/freight-rates" \
  -H "X-API-Key: your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '[
    {
      "originPort": "SHANGHAI",
      "destinationPort": "HAMBURG",
      "carrier": "MAERSK",
      "price20GP": 1200,
      "price40HQ": 2200
    },
    {
      "originPort": "NINGBO",
      "destinationPort": "ROTTERDAM",
      "carrier": "MSC",
      "price20GP": 1150,
      "price40HQ": 2150
    }
  ]'
```

---

## Openclaw 对接建议

### 1. API Key 管理

- 在 Indigenex 后台创建专门的 API Key（如："Openclaw 系统对接"）
- 妥善保存密钥，创建后只能查看一次
- 建议设置过期提醒，定期轮换

### 2. 数据同步策略

**推荐方案 - 增量同步**:
```
1. 首次同步：获取所有有效运价（status=ACTIVE, validTo >= today）
2. 定期同步（每小时/每天）：
   - 查询 updatedAt > 上次同步时间的记录
   - 更新本地数据
```

### 3. 字段映射参考

| Openclaw 字段 | Indigenex 字段 | 备注 |
|--------------|----------------|------|
| POL | originPort | 起运港 |
| POD | destinationPort | 目的港 |
| VIA | viaPort | 中转港 |
| Carrier | carrier | 船公司 |
| 20GP Price | price20GP | |
| 40HQ Price | price40HQ | |
| ETD | sailingDate | 开航日 |
| TT | transitTime | 航程 |

### 4. 批量导入 Excel 模板

如需通过 Excel 批量导入，字段顺序建议：

| 列 | 字段名 | 示例值 |
|----|--------|--------|
| A | originPort | SHANGHAI |
| B | destinationPort | HAMBURG |
| C | carrier | MAERSK |
| D | price20GP | 1200 |
| E | price40GP | 2100 |
| F | price40HQ | 2200 |
| G | validFrom | 2026-04-01 |
| H | validTo | 2026-04-30 |
| I | transitTime | 28 |
| J | schedule | 周一/三/五 |

---

## 技术支持

- **服务器地址**: http://47.236.193.197
- **API 基础路径**: /api/v1
- **文档更新**: 如有疑问请联系 Indigenex 技术团队

---

## 变更日志

| 日期 | 版本 | 变更内容 |
|------|------|----------|
| 2026-03-27 | v1.0 | 初始版本，支持运价 CRUD 操作 |
