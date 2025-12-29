#!/usr/bin/env python3
"""
TCM Clinic Beta Tester Password Generator
==========================================
Run this script to generate secure passwords for beta testers.
Copy the generated password and send to your testers.

Usage:
    python password_generator.py
    python password_generator.py --count 5
"""

import secrets
import string
import argparse

def generate_password(length: int = 12) -> str:
    """Generate a secure random password."""
    # Use mix of letters, digits, and safe special characters
    alphabet = string.ascii_letters + string.digits + "!@#$%"
    
    # Ensure at least one of each type
    password = [
        secrets.choice(string.ascii_uppercase),
        secrets.choice(string.ascii_lowercase),
        secrets.choice(string.digits),
        secrets.choice("!@#$%")
    ]
    
    # Fill the rest randomly
    password += [secrets.choice(alphabet) for _ in range(length - 4)]
    
    # Shuffle to randomize positions
    secrets.SystemRandom().shuffle(password)
    
    return ''.join(password)

def main():
    parser = argparse.ArgumentParser(description='Generate beta tester passwords')
    parser.add_argument('--count', '-c', type=int, default=1, 
                        help='Number of passwords to generate')
    parser.add_argument('--length', '-l', type=int, default=12,
                        help='Password length (default: 12)')
    args = parser.parse_args()
    
    print("\n" + "=" * 50)
    print("TCM Clinic - Beta Tester Password Generator")
    print("=" * 50 + "\n")
    
    for i in range(args.count):
        password = generate_password(args.length)
        print(f"Password {i + 1}: {password}")
    
    print("\n" + "-" * 50)
    print("Copy the password above and use it in the /gate page")
    print("to grant access to beta testers.")
    print("-" * 50 + "\n")

if __name__ == "__main__":
    main()
