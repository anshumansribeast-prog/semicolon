import tempfile
import unittest
from pathlib import Path

import learning_store


class LearningStoreTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.old_db = learning_store.DB_PATH
        learning_store.DB_PATH = Path(self.tmp.name) / "learning.db"

    def tearDown(self):
        learning_store.DB_PATH = self.old_db
        self.tmp.cleanup()

    def test_session_token_is_opaque_and_progress_persists(self):
        session = learning_store.create_session()
        token = session["token"]
        self.assertGreaterEqual(len(token), 40)
        self.assertIsNone(learning_store.read_progress("not-a-token"))
        saved = learning_store.write_progress(token, {
            "goals": [{"id": "g1", "text": "Finish Python", "done": True}],
            "completed_lessons": ["first-program#1", "bad/value#1", "first-program#1"]
        })
        self.assertEqual(len(saved["completed_lessons"]), 1)
        self.assertEqual(saved["completed_lessons"][0], "first-program#1")
        loaded = learning_store.read_progress(token)
        self.assertEqual(loaded["goals"][0]["text"], "Finish Python")
        self.assertTrue(loaded["goals"][0]["done"])

    def test_payload_limits_are_enforced(self):
        session = learning_store.create_session()
        with self.assertRaises(ValueError):
            learning_store.write_progress(session["token"], {"goals": [{}] * 101})
        with self.assertRaises(ValueError):
            learning_store.write_progress(session["token"], {"completed_lessons": ["x#1"] * 501})

    def test_unknown_tokens_cannot_read_or_write(self):
        self.assertIsNone(learning_store.read_progress("x" * 50))
        self.assertIsNone(learning_store.write_progress("x" * 50, {}))


if __name__ == "__main__":
    unittest.main()
