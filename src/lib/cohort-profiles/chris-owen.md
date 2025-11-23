---
title: Chris Owen
description: still here, still vibing, still me
---

<img src="https://ca.slack-edge.com/T017H5PPH1P-U026GN52WTS-581dc041f582-512" width="100" height="100">

<script>
  import { onMount } from 'svelte';

  let age = '';
  let popover = { visible: false, content: '', x: 0, y: 0, loading: false };
  let hoverTimeout;

  // Function to calculate Greatest Common Divisor
  const gcd = (a, b) => {
    return b === 0 ? a : gcd(b, a % b);
  };

  // Fetch Wikipedia summary
  const fetchWikipedia = async (word) => {
    try {
      const response = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(word)}`
      );
      if (!response.ok) throw new Error('Not found');
      const data = await response.json();
      return data.extract || 'No summary available';
    } catch (error) {
      return `No Wikipedia entry found for "${word}"`;
    }
  };

  // Handle word hover
  const handleWordHover = async (event) => {
    const word = event.target.textContent.trim();
    if (word.length < 3) return; // Skip short words

    clearTimeout(hoverTimeout);

    hoverTimeout = setTimeout(async () => {
      popover = {
        visible: true,
        content: '',
        x: event.clientX,
        y: event.clientY,
        loading: true
      };

      const content = await fetchWikipedia(word);
      popover = {
        visible: true,
        content,
        x: event.clientX,
        y: event.clientY,
        loading: false
      };
    }, 500); // Wait 500ms before showing popover
  };

  const handleWordLeave = () => {
    clearTimeout(hoverTimeout);
    popover = { visible: false, content: '', x: 0, y: 0, loading: false };
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

    // Make words hoverable (but skip age display and already wrapped content)
    const textElements = document.querySelectorAll('p, li, h1, h2, h3, h4, h5, h6');
    textElements.forEach(element => {
      // Skip if element contains the age display
      if (element.querySelector('.age-display')) return;

      const text = element.innerHTML;
      // Only wrap if not already wrapped
      if (!text.includes('hoverable-word')) {
        const wrappedText = text.replace(/\b(\w{3,})\b/g, '<span class="hoverable-word">$1</span>');
        element.innerHTML = wrappedText;
      }
    });

    // Add event listeners
    document.querySelectorAll('.hoverable-word').forEach(span => {
      span.addEventListener('mouseenter', handleWordHover);
      span.addEventListener('mouseleave', handleWordLeave);
    });
  });
</script>

## About Me

Hi, I'm Chris and I'm <span class="age-display">{@html age}</span> years old.

I work as a teacher and coder.

I'm interested in

- building tools that help people learn and create
- exploring new ways of teaching and learning
- building technologies that solve peoples actual problems

{#if popover.visible}

  <div
    class="wiki-popover"
    style="left: {popover.x + 10}px; top: {popover.y + 10}px;"
  >
    {#if popover.loading}
      <p>Loading...</p>
    {:else}
      <p>{popover.content}</p>
    {/if}
  </div>
{/if}

<style>
  :global(.hoverable-word) {
    cursor: help;
    text-decoration: underline dotted;
    text-decoration-color: rgba(100, 100, 255, 0.3);
    transition: all 0.2s ease;
  }

  :global(.hoverable-word:hover) {
    text-decoration-color: rgba(100, 100, 255, 0.8);
    background-color: rgba(100, 100, 255, 0.1);
  }

  .wiki-popover {
    position: fixed;
    background: white;
    border: 2px solid #333;
    border-radius: 8px;
    padding: 12px;
    max-width: 400px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    z-index: 9999;
    font-size: 14px;
    line-height: 1.5;
  }

  .wiki-popover p {
    margin: 0;
  }
</style>
