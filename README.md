# 美股与A股ETF映射图谱

一页式 MVP 投资看板：用美股主题 ETF 的短期、中期、长期强弱，映射到 A 股场内 ETF 候选池。

## MVP 功能

- 美股主题 ETF 强弱榜：支持短期、中期、长期、综合维度排序。
- A 股场内 ETF 映射：每个主题展示候选 ETF、映射分数、成交额、近期涨跌幅。
- 主题传导状态：共振、传导、背离三类信号。
- 映射解释：展示标签命中、主题纯度、流动性或替代关系。
- 人物雷达：追踪特朗普、黄仁勋、马斯克公开发声后的上市公司市场信号。
- 单页静态部署：用户无需注册，页面可直接部署到 GitHub Pages、Cloudflare Pages 或任意静态服务器。
- 数据刷新入口：`scripts/generate_snapshot.py` 生成 `data/latest.json`，`scripts/generate_people_snapshot.py` 生成 `data/people-latest.json`。

## 本地预览

如果只是查看内置样例，直接打开 `index.html` 也可以。为了让页面读取 `data/latest.json`，推荐启动一个静态服务：

```bash
python3 -m http.server 5173
```

然后访问：

```text
http://localhost:5173
```

## 作为 Codex Skill 使用

仓库根目录已包含 `SKILL.md` 和 `agents/openai.yaml`，可作为 `AI-ris` skill 使用。适合让 Codex 刷新快照、扩展主题映射、维护数据结构、验证静态看板或准备 GitHub Pages 部署。

基础校验：

```bash
python3 scripts/e2e_smoke.py
```

## 数据刷新

默认快照位于：

```text
data/latest.json
data/people-latest.json
```

刷新脚本：

```bash
python3 scripts/generate_snapshot.py
python3 scripts/generate_people_snapshot.py
```

脚本会尽量使用免费数据：

- 美股 ETF：使用 Nasdaq 历史日线收盘价，强弱分数使用最新收盘价相对 EMA 的偏离计算；历史不足的标的使用可得日线初始化 EMA。
- A 股 ETF：优先本地 `/Users/zhangchao/.claude/skills/finance-all-in-one` 的 `get_etf_kline`。
- 人物雷达：事件事实来自人工核验的公开来源；涨跌幅优先通过 `finance-all-in-one` 获取美股日线，失败时降级到 Nasdaq 历史日线收盘价，并把实际行情源写入 `priceBasis.source`。
- 人物照片：页面优先加载 `assets/people/*.webp` 本地静态图，外部真实照片链接只作为失败兜底，避免首屏受外链延时影响。
- 任一数据源失败时保留现有快照结构，避免页面不可用。

可用于早晚两次定时：

- 北京时间 08:00：美股收盘后刷新美股强弱。
- 北京时间 18:00：A 股收盘后刷新 A 股候选 ETF 与共振状态。

人物雷达不是直接抓社交媒体后自动入库。上线后推荐分两层更新：

- 事件池：新增人物发声先进入人工/半自动审核清单，必须满足「来源 URL 可访问、公司为可交易上市主体、事件日期明确」。
- 行情层：已入库事件每天早晚自动重算 `returnSinceMention`、`firstDayReturn` 和 `priceBasis`，页面只读取生成后的静态 JSON。

这样可以做到行情准实时刷新，同时避免把传闻、私有公司、OTC 无稳定行情的标的展示为可计算结果。

## 数据结构

核心结构是 `themes[]`：

```json
{
  "id": "memory_chips",
  "name": "存储芯片",
  "signal": "传导",
  "confidence": 86,
  "tags": ["DRAM", "NAND", "存储", "半导体"],
  "us": {
    "primary": "DRAM",
    "etfs": ["DRAM", "SOXX", "SMH"],
    "returns": { "1d": 2.8, "5d": 7.6, "20d": 13.4, "60d": 24.8, "120d": 31.5, "ytd": 34.2 },
    "ema": { "ema5": 1.8, "ema20": 4.2, "ema60": 8.1, "ema120": 11.6, "emaYtd": 10.4 },
    "rel": { "5d": 4.1, "20d": 7.8, "60d": 12.4, "120d": 15.1 },
    "strength": { "short": 94, "mid": 91, "long": 88, "all": 92 }
  },
  "cn": [
    {
      "code": "512480",
      "name": "半导体ETF国联安",
      "mappingScore": 88,
      "status": "传导",
      "reasons": ["A股暂无纯存储主题场内基金，使用半导体宽主题替代映射"]
    }
  ]
}
```

美股主题强弱分数口径：

```text
EMA信号N = (最新收盘价 / EMA_N - 1) * 100
score(x) = clamp(round(50 + x * 3), 0, 99)

短期 = score(EMA5信号 * 0.4 + EMA20信号 * 0.6)
中期 = score(EMA20信号 * 0.55 + EMA60信号 * 0.45)
长期 = score(EMA120信号 * 0.6 + EMA年内信号 * 0.4)
综合 = round(短期 * 0.25 + 中期 * 0.35 + 长期 * 0.4)
```

## 下一步增强

- 扩展到 30-50 个美股 ETF 与 80-150 个 A 股场内 ETF。
- 把主题标签与 ETF 基础信息拆成可维护的 `mapping_seed.json`。
- 增加历史相关性评分与成份股行业相似度评分。
- 增加 GitHub Actions 定时任务，每天 08:00 和 18:00 自动提交新快照。
