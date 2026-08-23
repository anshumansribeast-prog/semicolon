from ai_router import should_fallback


def test_uncertain_answer_falls_back():
    assert should_fallback("[OUT_OF_KNOWLEDGE] I need another source.")
    assert should_fallback("I don't know enough to answer that reliably.")


def test_normal_answer_stays_primary():
    assert not should_fallback("A Python list is mutable and ordered.")
    assert not should_fallback("Here is the CSS fix and why it works.")


if __name__ == "__main__":
    test_uncertain_answer_falls_back()
    test_normal_answer_stays_primary()
    print("Ada model-router tests passed")
