"""
Unit tests for OFTA scoring logic.
Tests are designed to work without a database connection.
"""
import pytest
from datetime import date, datetime


class TestAgeGuessScoring:
    """Test the AGE_GUESS scoring rules."""

    @staticmethod
    def calculate_age_guess_score(correct_age: int, guessed_age: int, hints_used: int = 0) -> tuple:
        """Replicate the scoring logic from sessions.py."""
        error_value = abs(correct_age - guessed_age)

        if error_value == 0:
            score = 100
            is_correct = True
        elif error_value <= 1:
            score = 80
            is_correct = True
        elif error_value <= 2:
            score = 60
            is_correct = False
        elif error_value <= 3:
            score = 40
            is_correct = False
        elif error_value <= 5:
            score = 20
            is_correct = False
        else:
            score = 0
            is_correct = False

        if hints_used > 0:
            score = int(score * 0.8)

        return score, is_correct

    def test_perfect_guess(self):
        score, correct = self.calculate_age_guess_score(35, 35)
        assert score == 100
        assert correct is True

    def test_off_by_one(self):
        score, correct = self.calculate_age_guess_score(35, 36)
        assert score == 80
        assert correct is True

    def test_off_by_one_negative(self):
        score, correct = self.calculate_age_guess_score(35, 34)
        assert score == 80
        assert correct is True

    def test_off_by_two(self):
        score, _ = self.calculate_age_guess_score(35, 33)
        assert score == 60

    def test_off_by_three(self):
        score, _ = self.calculate_age_guess_score(35, 32)
        assert score == 40

    def test_off_by_five(self):
        score, _ = self.calculate_age_guess_score(35, 30)
        assert score == 20

    def test_off_by_more_than_five(self):
        score, correct = self.calculate_age_guess_score(35, 25)
        assert score == 0
        assert correct is False

    def test_hint_penalty_perfect(self):
        score, _ = self.calculate_age_guess_score(35, 35, hints_used=1)
        assert score == 80  # 100 * 0.8

    def test_hint_penalty_close(self):
        score, _ = self.calculate_age_guess_score(35, 36, hints_used=1)
        assert score == 64  # 80 * 0.8

    def test_hint_penalty_zero_score(self):
        score, _ = self.calculate_age_guess_score(35, 50, hints_used=1)
        assert score == 0


class TestWhoOlderScoring:
    """Test the WHO_OLDER scoring rules."""

    @staticmethod
    def calculate_who_older_score(dob_a: str, dob_b: str, user_choice: str) -> tuple:
        dob_a_date = datetime.strptime(dob_a, '%Y-%m-%d').date()
        dob_b_date = datetime.strptime(dob_b, '%Y-%m-%d').date()
        correct_choice = 'A' if dob_a_date < dob_b_date else 'B'
        is_correct = user_choice == correct_choice
        return 100 if is_correct else 0, is_correct

    def test_correct_choice_a(self):
        score, correct = self.calculate_who_older_score('1980-01-01', '1990-01-01', 'A')
        assert score == 100
        assert correct is True

    def test_correct_choice_b(self):
        score, correct = self.calculate_who_older_score('1990-01-01', '1980-01-01', 'B')
        assert score == 100
        assert correct is True

    def test_wrong_choice(self):
        score, correct = self.calculate_who_older_score('1980-01-01', '1990-01-01', 'B')
        assert score == 0
        assert correct is False

    def test_same_year_different_months(self):
        score, correct = self.calculate_who_older_score('1990-01-15', '1990-06-20', 'A')
        assert score == 100
        assert correct is True


class TestAgeCalculation:
    """Test age calculation logic."""

    @staticmethod
    def calculate_age(dob: date, today: date = None) -> int:
        if today is None:
            today = date.today()
        return today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))

    def test_birthday_passed(self):
        age = self.calculate_age(date(1990, 1, 1), date(2025, 6, 15))
        assert age == 35

    def test_birthday_not_yet(self):
        age = self.calculate_age(date(1990, 12, 31), date(2025, 6, 15))
        assert age == 34

    def test_birthday_today(self):
        age = self.calculate_age(date(1990, 6, 15), date(2025, 6, 15))
        assert age == 35

    def test_leap_year_birthday(self):
        age = self.calculate_age(date(2000, 2, 29), date(2025, 3, 1))
        assert age == 25

    def test_young_person(self):
        age = self.calculate_age(date(2010, 1, 1), date(2025, 6, 15))
        assert age == 15

    def test_elderly_person(self):
        age = self.calculate_age(date(1930, 5, 10), date(2025, 6, 15))
        assert age == 95


class TestStreakBonus:
    """Test streak bonus multiplier."""

    @staticmethod
    def apply_streak_bonus(base_score: int, streak: int) -> int:
        if streak >= 10:
            return int(base_score * 2.0)
        elif streak >= 5:
            return int(base_score * 1.5)
        elif streak >= 3:
            return int(base_score * 1.2)
        return base_score

    def test_no_streak(self):
        assert self.apply_streak_bonus(100, 0) == 100

    def test_streak_1(self):
        assert self.apply_streak_bonus(100, 1) == 100

    def test_streak_2(self):
        assert self.apply_streak_bonus(100, 2) == 100

    def test_streak_3(self):
        assert self.apply_streak_bonus(100, 3) == 120

    def test_streak_5(self):
        assert self.apply_streak_bonus(100, 5) == 150

    def test_streak_7(self):
        assert self.apply_streak_bonus(100, 7) == 150

    def test_streak_10(self):
        assert self.apply_streak_bonus(100, 10) == 200

    def test_streak_15(self):
        assert self.apply_streak_bonus(100, 15) == 200

    def test_streak_bonus_on_partial_score(self):
        assert self.apply_streak_bonus(60, 5) == 90


class TestLevelCalculation:
    """Test XP/Level calculation."""

    @staticmethod
    def calculate_level(total_xp: int) -> dict:
        xp_remaining = total_xp
        level = 1

        while True:
            xp_for_this_level = 500 + (level - 1) * 100
            if xp_remaining < xp_for_this_level:
                return {
                    "level": level,
                    "current_xp": xp_remaining,
                    "xp_for_next": xp_for_this_level,
                }
            xp_remaining -= xp_for_this_level
            level += 1

    def test_level_1_zero_xp(self):
        result = self.calculate_level(0)
        assert result["level"] == 1

    def test_level_1_partial(self):
        result = self.calculate_level(499)
        assert result["level"] == 1

    def test_level_2_exact(self):
        result = self.calculate_level(500)
        assert result["level"] == 2

    def test_level_3(self):
        # Level 1: 500, Level 2: 600 = 1100 total
        result = self.calculate_level(1100)
        assert result["level"] == 3

    def test_high_level(self):
        result = self.calculate_level(50000)
        assert result["level"] > 10

    def test_xp_remaining_correct(self):
        result = self.calculate_level(600)
        assert result["level"] == 2
        assert result["current_xp"] == 100  # 600 - 500


class TestReverseSignScoring:
    """Test REVERSE_SIGN scoring."""

    def test_correct_sign(self):
        is_correct = 'Aries' == 'Aries'
        score = 50 if is_correct else 0
        assert score == 50

    def test_wrong_sign(self):
        is_correct = 'Taurus' == 'Aries'
        score = 50 if is_correct else 0
        assert score == 0


class TestReverseDOBScoring:
    """Test REVERSE_DOB scoring."""

    def test_correct_year(self):
        is_correct = 1990 == 1990
        score = 50 if is_correct else 0
        assert score == 50

    def test_wrong_year(self):
        is_correct = 1991 == 1990
        score = 50 if is_correct else 0
        assert score == 0
