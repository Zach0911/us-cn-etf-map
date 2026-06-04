#!/usr/bin/env python3
"""Generate the static dashboard snapshot.

The MVP ships with a seed `data/latest.json`. This script refreshes prices when
free data libraries are available, then preserves the same front-end schema.
It is intentionally tolerant: if a source fails, the previous snapshot remains
usable so the public page does not break.
"""

from __future__ import annotations

import argparse
import json
import sys
import urllib.request
from datetime import date, datetime, time, timezone, timedelta
from pathlib import Path
from typing import Any
from zoneinfo import ZoneInfo


ROOT = Path(__file__).resolve().parents[1]
SNAPSHOT = ROOT / "data" / "latest.json"
FINANCE_SKILL = Path("/Users/zhangchao/.claude/skills/finance-all-in-one")
BJT = timezone(timedelta(hours=8))
NYT = ZoneInfo("America/New_York")
US_REGULAR_CLOSE = time(16, 0)
PERIODS = {
    "1d": 1,
    "5d": 5,
    "20d": 20,
    "60d": 60,
    "120d": 120,
}
NASDAQ_FROM = "2025-01-01"

SYNONYMS = {
    "DRAM": ["存储", "芯片", "半导体"],
    "NAND": ["存储", "芯片", "半导体"],
    "SOXX": ["半导体", "芯片"],
    "SMH": ["半导体", "芯片"],
    "XSD": ["半导体", "芯片"],
    "AI": ["人工智能", "计算机", "算力"],
    "GPU": ["芯片", "算力", "人工智能"],
    "BOTZ": ["机器人", "自动化"],
    "DRIV": ["新能源车", "汽车", "锂电"],
    "LIT": ["锂电", "新能源"],
    "TAN": ["光伏", "新能源"],
    "ICLN": ["清洁能源", "新能源"],
    "CIBR": ["网络安全", "计算机", "信息安全"],
    "BUG": ["网络安全", "计算机", "信息安全"],
    "ITA": ["军工", "航天"],
    "UFO": ["航天", "卫星", "军工"],
    "GLD": ["黄金"],
    "SLV": ["白银", "有色"],
    "KWEB": ["互联网", "恒生科技", "港股"],
    "XLF": ["银行", "非银", "金融"],
}


def load_snapshot() -> dict[str, Any]:
    if not SNAPSHOT.exists():
        raise SystemExit("data/latest.json 不存在。请先运行 README 中的 seed 生成步骤。")
    return json.loads(SNAPSHOT.read_text(encoding="utf-8"))


def calc_returns(values: list[float]) -> dict[str, float]:
    returns: dict[str, float] = {}
    if len(values) < 2:
        return returns
    last = values[-1]
    for key, days in PERIODS.items():
        if len(values) > days and values[-1 - days] > 0:
            returns[key] = round((last / values[-1 - days] - 1) * 100, 1)
    if values[0] > 0:
        returns["ytd"] = round((last / values[0] - 1) * 100, 1)
    return returns


def score_from_returns(returns: dict[str, float]) -> dict[str, int]:
    def clamp(value: float) -> int:
        return max(0, min(99, round(50 + value * 3)))

    short = clamp(returns.get("1d", 0) * 0.4 + returns.get("5d", 0) * 0.6)
    mid = clamp(returns.get("20d", 0) * 0.55 + returns.get("60d", 0) * 0.45)
    long = clamp(returns.get("120d", 0) * 0.6 + returns.get("ytd", returns.get("120d", 0)) * 0.4)
    all_score = round(short * 0.25 + mid * 0.35 + long * 0.4)
    return {"short": short, "mid": mid, "long": long, "all": all_score}


def calc_returns_newest_first(values: list[float], dates: list[datetime] | None = None) -> dict[str, float]:
    returns: dict[str, float] = {}
    if len(values) < 2:
        return returns
    last = values[0]
    for key, days in PERIODS.items():
        if len(values) > days and values[days] > 0:
            returns[key] = round((last / values[days] - 1) * 100, 1)
    if dates:
        year = dates[0].year
        ytd_base = next((idx for idx in range(len(dates) - 1, -1, -1) if dates[idx].year == year), None)
        if ytd_base and values[ytd_base] > 0:
            returns["ytd"] = round((last / values[ytd_base] - 1) * 100, 1)
    return returns


def last_eligible_us_close_date(now: datetime | None = None) -> date:
    """Return the latest US trading date whose regular session is allowed to be used.

    This guard avoids ever mixing pre-market, regular-session intraday, after-hours,
    or overnight prices into the static dashboard. The Nasdaq historical endpoint is
    daily close data, but we still cap the requested/accepted date by NYSE clock.
    """
    ny_now = (now or datetime.now(timezone.utc)).astimezone(NYT)
    eligible = ny_now.date()
    if ny_now.time() < US_REGULAR_CLOSE:
        eligible = eligible - timedelta(days=1)
    while eligible.weekday() >= 5:
        eligible = eligible - timedelta(days=1)
    return eligible


def fetch_nasdaq_etf_returns(ticker: str) -> dict[str, float]:
    end_date = last_eligible_us_close_date()
    url = (
        f"https://api.nasdaq.com/api/quote/{ticker}/historical"
        f"?assetclass=etf&fromdate={NASDAQ_FROM}&todate={end_date.isoformat()}&limit=9999"
    )
    request = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0",
            "Accept": "application/json",
            "Origin": "https://www.nasdaq.com",
            "Referer": "https://www.nasdaq.com/",
        },
    )
    with urllib.request.urlopen(request, timeout=12) as response:
        payload = json.loads(response.read().decode("utf-8"))
    rows = payload.get("data", {}).get("tradesTable", {}).get("rows", [])
    closes: list[float] = []
    dates: list[datetime] = []
    for row in rows:
        close = str(row.get("close", "")).replace("$", "").replace(",", "")
        try:
            row_date = datetime.strptime(row["date"], "%m/%d/%Y").date()
            if row_date > end_date:
                continue
            closes.append(float(close))
            dates.append(datetime.combine(row_date, US_REGULAR_CLOSE, tzinfo=NYT))
        except (KeyError, TypeError, ValueError):
            continue
    return calc_returns_newest_first(closes, dates)


def expand_tags(tags: list[str]) -> set[str]:
    expanded = {tag.lower() for tag in tags}
    for tag in tags:
        expanded.update(item.lower() for item in SYNONYMS.get(tag, []))
    return expanded


def refresh_mapping_scores(snapshot: dict[str, Any]) -> None:
    for theme in snapshot["themes"]:
        tags = expand_tags(theme.get("tags", []))
        for etf in theme["cn"]:
            text = " ".join(
                [
                    etf.get("code", ""),
                    etf.get("name", ""),
                    etf.get("index", ""),
                    " ".join(etf.get("reasons", [])),
                ]
            ).lower()
            hits = [tag for tag in tags if tag and tag in text]
            direct_name_hit = any(tag in etf.get("name", "").lower() for tag in tags)
            index_hit = any(tag in etf.get("index", "").lower() for tag in tags)
            liquidity = min(10, float(etf.get("amount") or 0))
            score = 35 + len(hits) * 9 + (18 if direct_name_hit else 0) + (12 if index_hit else 0) + liquidity
            reasons = " ".join(etf.get("reasons", []))
            if "纯度低" in reasons:
                score = min(score, 68)
            elif "暂无纯" in reasons or "替代映射" in reasons or "宽主题替代" in reasons:
                score = min(score, 88)
            if "直接匹配" in reasons or "完全匹配" in reasons:
                score = max(score, 90)
            etf["mappingScore"] = max(30, min(99, round(score)))
            if hits:
                etf["matchedTags"] = sorted(set(hits))[:8]


def try_update_us(snapshot: dict[str, Any]) -> None:
    tickers = sorted({theme["us"]["primary"] for theme in snapshot["themes"]} | {"SPY"})
    nasdaq_returns: dict[str, dict[str, float]] = {}
    try:
        for ticker in tickers:
            nasdaq_returns[ticker] = fetch_nasdaq_etf_returns(ticker)
    except Exception as exc:
        print(f"Nasdaq美股刷新失败，尝试yfinance降级: {exc}")
    else:
        spy_returns = nasdaq_returns.get("SPY", {})
        for theme in snapshot["themes"]:
            ticker = theme["us"]["primary"]
            returns = nasdaq_returns.get(ticker, {})
            if not returns:
                continue
            # Replace instead of update so insufficient-history periods do not keep stale values.
            theme["us"]["returns"] = returns
            theme["us"]["rel"] = {
                key: round(returns.get(key, 0) - spy_returns.get(key, 0), 1)
                for key in ("5d", "20d", "60d", "120d")
                if key in returns and key in spy_returns
            }
            theme["us"]["strength"] = score_from_returns(theme["us"]["returns"])
        snapshot["sourceNote"] = (
            "生产校验版：A股ETF代码、名称、成交额和涨跌幅来自东方财富公开行情；"
            "美股主ETF涨跌幅仅使用Nasdaq常规交易时段日线收盘价，不使用盘后、夜盘或实时价。"
            "历史不足的标的仅展示可计算周期。"
        )
        return

    print("Nasdaq常规收盘数据不可用，跳过美股刷新，避免使用盘后/夜盘/实时价降级源。")


def try_update_cn(snapshot: dict[str, Any]) -> None:
    if FINANCE_SKILL.exists():
        sys.path.insert(0, str(FINANCE_SKILL))
    try:
        from api import get_etf_kline  # type: ignore
    except Exception:
        print("finance-all-in-one 不可用，跳过A股刷新。")
        return

    seen: dict[str, dict[str, float]] = {}
    for theme in snapshot["themes"]:
        for etf in theme["cn"]:
            code = etf["code"]
            if code not in seen:
                try:
                    result = get_etf_kline(code, limit=150)
                    rows = result.data.to_dict("records")
                    close_key = next((key for key in ("close", "收盘", "收盘价") if rows and key in rows[-1]), None)
                    if not close_key:
                        continue
                    closes = [float(row[close_key]) for row in rows if row.get(close_key)]
                    seen[code] = calc_returns(closes)
                except Exception as exc:
                    print(f"A股ETF {code} 刷新失败: {exc}")
                    seen[code] = {}
            if seen[code]:
                etf["returns"].update({k: v for k, v in seen[code].items() if k != "ytd"})


def infer_signals(snapshot: dict[str, Any]) -> None:
    for theme in snapshot["themes"]:
        us_score = theme["us"]["strength"]["all"]
        cn_scores = [etf["returns"].get("20d", 0) + etf["returns"].get("60d", 0) * 0.5 for etf in theme["cn"]]
        cn_score = max(cn_scores) if cn_scores else 0
        if us_score >= 72 and cn_score >= 10:
            theme["signal"] = "共振"
        elif us_score >= 68 and cn_score < 8:
            theme["signal"] = "传导"
        elif us_score >= 58 and cn_score < 2:
            theme["signal"] = "背离"
        theme["confidence"] = max(55, min(96, round((us_score + max(etf["mappingScore"] for etf in theme["cn"])) / 2)))


def main() -> None:
    parser = argparse.ArgumentParser(description="生成美股-A股ETF映射图谱快照")
    parser.add_argument("--skip-us", action="store_true", help="跳过 yfinance 美股刷新")
    parser.add_argument("--skip-cn", action="store_true", help="跳过 finance-all-in-one A股刷新")
    args = parser.parse_args()

    snapshot = load_snapshot()
    if not args.skip_us:
        try_update_us(snapshot)
    if not args.skip_cn:
        try_update_cn(snapshot)
    refresh_mapping_scores(snapshot)
    if not (args.skip_us and args.skip_cn):
        infer_signals(snapshot)
    snapshot["updatedAt"] = datetime.now(BJT).strftime("%Y-%m-%dT%H:%M:%S+08:00")
    snapshot["date"] = datetime.now(BJT).strftime("%Y-%m-%d")
    SNAPSHOT.write_text(json.dumps(snapshot, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"OK: {SNAPSHOT}")


if __name__ == "__main__":
    main()
