from sitecustomize import MARKER, should_fallback


def test_marker_triggers_fallback():
    assert should_fallback(f"{MARKER} I don't know this yet")


def test_clear_uncertainty_triggers_fallback():
    assert should_fallback("I don't know enough to answer that reliably.")
    assert should_fallback("This is outside my knowledge.")


def test_normal_answer_does_not_trigger_fallback():
    assert not should_fallback("A Python list is an ordered mutable collection.")
    assert not should_fallback("Here is the CSS fix and why it works.")


if __name__ == "__main__":
    test_marker_triggers_fallback()
    test_clear_uncertainty_triggers_fallback()
    test_normal_answer_does_not_trigger_fallback()
    print("openai fallback gate: all tests passed")
