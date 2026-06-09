import sys
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from scripts.generate_snapshot import calc_ema_newest_first, score_from_ema  # noqa: E402


def clamp(value: float) -> int:
    return max(0, min(99, round(50 + value * 3)))


class SnapshotScoreTest(unittest.TestCase):
    def test_ema_metrics_are_latest_close_distance_from_ema(self) -> None:
        values_newest_first = [12, 11, 10, 9, 8]
        alpha = 2 / (5 + 1)
        ema5 = 8
        for value in [9, 10, 11, 12]:
            ema5 = value * alpha + ema5 * (1 - alpha)

        result = calc_ema_newest_first(values_newest_first)

        self.assertEqual(result["ema5"], round((12 / ema5 - 1) * 100, 1))
        self.assertEqual({"ema5", "ema20", "ema60", "ema120", "emaYtd"}, set(result))

    def test_strength_scores_use_ema_parameters(self) -> None:
        ema = {
            "ema5": 1.0,
            "ema20": 2.0,
            "ema60": 4.0,
            "ema120": 6.0,
            "emaYtd": 8.0,
        }

        short = clamp(ema["ema5"] * 0.4 + ema["ema20"] * 0.6)
        mid = clamp(ema["ema20"] * 0.55 + ema["ema60"] * 0.45)
        long = clamp(ema["ema120"] * 0.6 + ema["emaYtd"] * 0.4)

        self.assertEqual(
            score_from_ema(ema),
            {
                "short": short,
                "mid": mid,
                "long": long,
                "all": round(short * 0.25 + mid * 0.35 + long * 0.4),
            },
        )


if __name__ == "__main__":
    unittest.main()
