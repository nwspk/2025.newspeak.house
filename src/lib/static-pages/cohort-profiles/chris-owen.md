---
title: Chris Owen
description: still here, still vibing, still me
---

<img src="https://ca.slack-edge.com/T017H5PPH1P-U026GN52WTS-581dc041f582-512" width="100" height="100">

<script>
  import { onMount } from 'svelte';

  let age = '';

  // Function to calculate Greatest Common Divisor
  const gcd = (a, b) => {
    return b === 0 ? a : gcd(b, a % b);
  };

  onMount(() => {
    const birthDate = new Date(1992, 6, 13); // Month is 0-indexed, so 6 = July
    const today = new Date();

    // Calculate full years
    let years = today.getFullYear() - birthDate.getFullYear();

    // Get the most recent birthday
    const lastBirthday = new Date(today.getFullYear(), 6, 13);
    if (today < lastBirthday) {
      years--;
      lastBirthday.setFullYear(lastBirthday.getFullYear() - 1);
    }

    // Calculate days since last birthday
    const daysSinceBirthday = Math.floor((today - lastBirthday) / (1000 * 60 * 60 * 24));

    // Calculate days in current year (accounting for leap years)
    const nextBirthday = new Date(lastBirthday.getFullYear() + 1, 6, 13);
    const daysInYear = Math.floor((nextBirthday - lastBirthday) / (1000 * 60 * 60 * 24));

    // Simplify the fraction
    const divisor = gcd(daysSinceBirthday, daysInYear);
    const simplifiedNumerator = daysSinceBirthday / divisor;
    const simplifiedDenominator = daysInYear / divisor;

    // Set age as simplified fraction
    age = `${years} and <sup>${simplifiedNumerator}</sup>/<sub>${simplifiedDenominator}</sub>`;
  });
</script>

## About Me

Hi, I'm Chris and I'm {@html age} years old.

I work as a teacher and coder.

I'm interested in

- building tools that help people learn and create
- exploring new ways of teaching and learning
- building technologies that solve peoples actual problems
