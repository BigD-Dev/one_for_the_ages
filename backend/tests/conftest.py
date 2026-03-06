"""
Test configuration for OFTA backend tests.
"""
import pytest
import os

# Set test environment
os.environ["ENVIRONMENT"] = "test"
