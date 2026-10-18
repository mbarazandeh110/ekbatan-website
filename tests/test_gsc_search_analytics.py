import unittest
from datetime import date
from unittest.mock import patch

from scripts.gsc_search_analytics import date_window, query_search_analytics


class DateWindowTests(unittest.TestCase):
    def test_default_window_excludes_recent_days(self):
        self.assertEqual(
            date_window(date(2026, 10, 18), days=28, lag_days=3),
            ("2026-09-18", "2026-10-15"),
        )

    def test_rejects_invalid_window(self):
        with self.assertRaises(ValueError):
            date_window(date(2026, 10, 18), days=0)


class QueryNormalizationTests(unittest.TestCase):
    @patch("scripts.gsc_search_analytics._request_json")
    def test_maps_dimensions_and_metrics(self, request_json):
        request_json.return_value = {
            "rows": [{
                "keys": ["kubernetes"],
                "clicks": 12,
                "impressions": 300,
                "ctr": 0.04,
                "position": 7.5,
            }]
        }
        rows = query_search_analytics(
            "access-token", "sc-domain:ekbatan.tech",
            "2026-09-18", "2026-10-15", ["query"]
        )
        self.assertEqual(rows[0]["query"], "kubernetes")
        self.assertEqual(rows[0]["clicks"], 12)
        self.assertEqual(rows[0]["position"], 7.5)
        request_json.assert_called_once()
        self.assertIn("sc-domain%3Aekbatan.tech", request_json.call_args.args[0])


if __name__ == "__main__":
    unittest.main()
