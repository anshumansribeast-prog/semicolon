import unittest

import ada_runtime


class AdaRuntimeTests(unittest.TestCase):
    def test_normal_answer_does_not_fallback(self):
        self.assertFalse(ada_runtime._needs_fallback("Here is the correct Python fix."))

    def test_unknown_marker_triggers_fallback(self):
        self.assertTrue(ada_runtime._needs_fallback("I cannot verify this. [OUT_OF_KNOWLEDGE]"))

    def test_uncertain_answer_triggers_fallback(self):
        self.assertTrue(ada_runtime._needs_fallback("I'm not sure about that."))

    def test_empty_answer_triggers_fallback(self):
        self.assertTrue(ada_runtime._needs_fallback(""))


if __name__ == "__main__":
    unittest.main()
