# Indigenex 运价管理 API 接口文档

> 适用于 Open Claw AI 智能体对接

---

## 基本信息

| 项目 | 内容 |
|------|------|
| Base URL | `http://your-domain/api` |
| 认证方式 | API Key (请求头) |
| 内容类型 | `application/json` |

### 认证方式

所有请求需要在 Header 中携带 API Key：

```
X-API-Key: your-api-key-here
```

> 注意：API Key 需要先在管理后台生成。

---

## 接口列表

### 1. 查询运价列表

获取所有运价记录，支持分页和筛选。

```
GET /api/v1/freight-rates
```

#### 请求参数 (Query)

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | integer | 否 | 页码，默认 1 |
| limit | integer | 否 | 每页数量，默认 20 |
| originPort | string | 否 | 起运港名称（模糊匹配） |
| destinationPort | string | 否 | 目的港名称（模糊匹配） |
| carrier | string | 否 | 船公司名称（模糊匹配） |
| status | string | 否 | 状态：ACTIVE/EXPIRED/DRAFT/SUSPENDED |
| search | string | 否 | 全局搜索（航线/港口/船公司） |

#### 响应示例

```json
{
  "success": true,
  "data": {
    "rates": [
      {
        "id": "uuid-string",
        "originPort": "青岛",
        "originPortEn": "QINGDAO",
        "destinationPort": "墨尔本",
        "destinationPortEn": "MELBOURNE",
        "viaPort": "釜山",
        "viaPortEn": "BUSAN",
        "transportMode": "SEA",
        "carrier": "COSCO",
        "carrierLogo": null,
        "transitTime": 25,
        "price20GP": 1200,
        "price40GP": 2000,
        "price40HQ": 2100,
        "price45HQ": null,
        "priceLCL": null,
        "currency": "USD",
        "surcharges": [
          { "name": "ORC", "amount": 150, "unit": "per_container" },
          { "name": "THC", "amount": 120, "unit": "per_container" }
        ],
        "validFrom": "2026-03-01T00:00:00.000Z",
        "validTo": "2026-03-31T00:00:00.000Z",
        "schedule": "Mon/Wed/Fri",
        "spaceStatus": "AVAILABLE",
        "remarks": "备注信息",
        "status": "ACTIVE",
        "createdAt": "2026-03-20T10:30:00.000Z",
        "updatedAt": "2026-03-20T10:30:00.000Z"
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

### 2. 获取运价详情

根据ID获取单条运价记录。

```
GET /api/v1/freight-rates/:id
```

#### 响应示例

```json
{
  "success": true,
  "data": {
    "rate": {
      "id": "uuid-string",
      "originPort": "青岛",
      "destinationPort": "墨尔本",
      "viaPort": "釜山",
      "transportMode": "SEA",
      "carrier": "COSCO",
      "transitTime": 25,
      "price20GP": 1200,
      "price40GP": 2000,
      "price40HQ": 2100,
      "currency": "USD",
      "surcharges": [{ "name": "ORC", "amount": 150, "unit": "per_container" }],
      "validFrom": "2026-03-01T00:00:00.000Z",
      "validTo": "2026-03-31T00:00:00.000Z",
      "remarks": "备注",
      "status": "ACTIVE"
    }
  }
}
```

---

### 3. 创建运价（单条/批量）

创建新的运价记录，支持单条或批量创建。

```
POST /api/v1/freight-rates
```

#### 请求体

**单条创建：**

```json
{
  "originPort": "青岛",
  "originPortEn": "QINGDAO",
  "destinationPort": "墨尔本",
  "destinationPortEn": "MELBOURNE",
  "viaPort": "釜山",
  "viaPortEn": "BUSAN",
  "transportMode": "SEA",
  "carrier": "COSCO",
  "transitTime": 25,
  "price20GP": 1200,
  "price40GP": 2000,
  "price40HQ": 2100,
  "price45HQ": null,
  "priceLCL": null,
  "currency": "USD",
  "surcharges": [
    { "name": "ORC", "amount": 150, "unit": "per_container" },
    { "name": "THC", "amount": 120, "unit": "per_container" }
  ],
  "validFrom": "2026-03-01",
  "validTo": "2026-03-31",
  "schedule": "Mon/Wed/Fri",
  "spaceStatus": "AVAILABLE",
  "remarks": "备注信息",
  "status": "ACTIVE"
}
```

**批量创建：**

```json
[
  { /* 第一条运价 */ },
  { /* 第二条运价 */ }
]
```

#### 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| originPort | string | ✅ | 起运港（中文） |
| originPortEn | string | 否 | 起运港（英文） |
| destinationPort | string | ✅ | 目的港（中文） |
| destinationPortEn | string | 否 | 目的港（英文） |
| viaPort | string | 否 | 中转港（中文） |
| viaPortEn | string | 否 | 中转港（英文） |
| transportMode | string | 否 | 运输方式：SEA/AIR/LAND/RAIL，默认 SEA |
| carrier | string | 否 | 船公司/承运人 |
| transitTime | integer | 否 | 航程（天） |
| price20GP | number | 否 | 20GP价格 |
| price40GP | number | 否 | 40GP价格 |
| price40HQ | number | 否 | 40HQ价格 |
| price45HQ | number | 否 | 45HQ价格 |
| priceLCL | number | 否 | 拼箱价格（每立方） |
| currency | string | 否 | 币种：USD/CNY/EUR，默认 USD |
| surcharges | array | 否 | 附加费数组 |
| validFrom | string | ✅ | 生效日期（YYYY-MM-DD） |
| validTo | string | ✅ | 到期日期（YYYY-MM-DD） |
| schedule | string | 否 | 船期 |
| spaceStatus | string | 否 | 舱位状态：AVAILABLE/LIMITED/FULL |
| remarks | string | 否 | 备注 |
| status | string | 否 | 状态：ACTIVE/DRAFT/SUSPENDED，默认 DRAFT |

#### surcharges 格式

```json
[
  {
    "name": "ORC",           // 费用名称
    "amount": 150,           // 金额
    "unit": "per_container"  // 单位：per_container/per_ton/per_cbm/per_bl
  }
]
```

#### 响应示例

```json
{
  "success": true,
  "message": "运价创建成功",
  "data": {
    "rate": { /* 创建的运价对象 */ }
  }
}
```

批量创建时响应：

```json
{
  "success": true,
  "message": "批量创建成功",
  "data": {
    "rates": [ /* 创建的运价数组 */ ],
    "createdCount": 2
  }
}
```

---

### 4. 更新运价

更新指定ID的运价记录。

```
PUT /api/v1/freight-rates/:id
```

#### 请求体

与创建运价相同，只需传入需要更新的字段。

```json
{
  "price20GP": 1300,
  "price40GP": 2100,
  "validTo": "2026-04-30"
}
```

#### 响应示例

```json
{
  "success": true,
  "message": "运价更新成功",
  "data": {
    "rate": { /* 更新后的运价对象 */ }
  }
}
```

---

### 5. 删除运价

删除指定ID的运价记录。

```
DELETE /api/v1/freight-rates/:id
```

#### 响应示例

```json
{
  "success": true,
  "message": "运价删除成功"
}
```

---

### 6. 批量导入运价（Excel）

通过Excel文件批量导入运价。

```
POST /api/admin/freight-rates/import
```

> 注意：此接口需要管理员登录Cookie认证，暂不支持API Key

#### 请求格式

Content-Type: `multipart/form-data`

| 字段 | 类型 | 说明 |
|------|------|------|
| file | File | Excel文件 (.xlsx, .xls, .csv) |

#### Excel模板格式

| 航线 | 起运港 | 目的港 | 中转港 | 运输方式 | 船公司 | 20GP | 40GP | 40HQ | 币种 | 航程 | 生效日期 | 到期日期 | 备注 |
|------|--------|--------|--------|----------|--------|------|------|------|------|------|----------|----------|------|
| 澳新线 | 青岛 | 墨尔本 | 釜山 | SEA | COSCO | 1200 | 2000 | 2100 | USD | 25 | 2026-03-01 | 2026-03-31 | 备注 |

#### 响应示例

```json
{
  "success": true,
  "message": "导入完成：成功 150 条，失败 0 条",
  "data": {
    "importBatchId": "BATCH_1710844800000",
    "total": 150,
    "success": 150,
    "failed": 0,
    "errors": []
  }
}
```

---

## 数据字典

### 运输方式 (transportMode)

| 值 | 说明 |
|------|------|
| SEA | 海运 |
| AIR | 空运 |
| LAND | 陆运 |
| RAIL | 铁路 |

### 运价状态 (status)

| 值 | 说明 |
|------|------|
| ACTIVE | 生效中 |
| DRAFT | 草稿 |
| SUSPENDED | 已暂停 |
| EXPIRED | 已过期（系统自动标记） |

### 舱位状态 (spaceStatus)

| 值 | 说明 |
|------|------|
| AVAILABLE | 有舱位 |
| LIMITED | 舱位紧张 |
| FULL | 舱位已满 |

### 附加费单位 (unit)

| 值 | 说明 |
|------|------|
| per_container | 每柜 |
| per_ton | 每吨 |
| per_cbm | 每立方 |
| per_bl | 每票 |

### 币种 (currency)

| 值 | 说明 |
|------|------|
| USD | 美元 |
| CNY | 人民币 |
| EUR | 欧元 |

---

## 错误码

| HTTP状态码 | 说明 |
|------------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权（API Key无效） |
| 403 | 禁止访问（权限不足） |
| 404 | 资源不存在 |
| 422 | 验证错误 |
| 429 | 请求过于频繁 |
| 500 | 服务器内部错误 |

### 错误响应格式

```json
{
  "success": false,
  "message": "错误描述",
  "errors": [
    { "field": "originPort", "message": "起运港不能为空" }
  ]
}
```

---

## Open Claw AI 智能体配置示例

### 1. API 配置

```yaml
api_config:
  base_url: "http://your-domain/api"
  auth:
    type: "api_key"
    header: "X-API-Key"
    key: "${API_KEY}"
  timeout: 30000
```

### 2. 工具定义

```json
{
  "tools": [
    {
      "name": "search_freight_rates",
      "description": "查询运价列表",
      "parameters": {
        "originPort": {"type": "string", "description": "起运港"},
        "destinationPort": {"type": "string", "description": "目的港"},
        "carrier": {"type": "string", "description": "船公司"}
      }
    },
    {
      "name": "create_freight_rate",
      "description": "创建运价",
      "parameters": {
        "originPort": {"type": "string", "required": true},
        "destinationPort": {"type": "string", "required": true},
        "carrier": {"type": "string"},
        "price20GP": {"type": "number"},
        "price40GP": {"type": "number"},
        "price40HQ": {"type": "number"},
        "validFrom": {"type": "string", "format": "date"},
        "validTo": {"type": "string", "format": "date"}
      }
    },
    {
      "name": "update_freight_rate",
      "description": "更新运价",
      "parameters": {
        "id": {"type": "string", "required": true},
        "price20GP": {"type": "number"},
        "price40GP": {"type": "number"},
        "price40HQ": {"type": "number"},
        "validTo": {"type": "string", "format": "date"}
      }
    },
    {
      "name": "delete_freight_rate",
      "description": "删除运价",
      "parameters": {
        "id": {"type": "string", "required": true}
      }
    }
  ]
}
```

### 3. 使用示例

**查询运价：**
```
用户：查询从青岛到墨尔本的运价
AI：调用 search_freight_rates({"originPort": "青岛", "destinationPort": "墨尔本"})
```

**创建运价：**
```
用户：添加一条COSCO青岛到墨尔本的海运价，20GP 1200，40GP 2000，有效期到3月底
AI：调用 create_freight_rate({
  "originPort": "青岛",
  "destinationPort": "墨尔本",
  "carrier": "COSCO",
  "transportMode": "SEA",
  "price20GP": 1200,
  "price40GP": 2000,
  "validFrom": "2026-03-01",
  "validTo": "2026-03-31"
})
```

---

## 联系方式

如有接口对接问题，请联系：

- 技术支持：[your-email@domain.com]
- 接口文档版本：v1.0
- 最后更新：2026-03-24
