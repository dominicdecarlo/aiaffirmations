<svelte:head>
  <link href="https://fonts.googleapis.com/css2?family=UnifrakturMaguntia&family=Crimson+Text&display=swap" rel="stylesheet">
</svelte:head>

<script>
  import { fly } from 'svelte/transition';
  import { onMount, tick } from 'svelte';

  let inputVisible = false;
  let expanded = false;
  let userInput = '';
  let response = '';
  let currentTranslationIndex = 0;
  let typing = false;
  let displayedResponse = '';

  const translations = [
    "Affirmations",
    "Affermazioni", // Italian
    "अभिकथन", // Hindi
    "Afirmaciones", // Spanish
    "肯定", // Chinese
    "Подтверждения", // Russian
    "Afirmações", // Portuguese
    "確認", // Japanese
    "Afirmasi", // Indonesian
    "Афірмації", // Ukrainian
    "التأكيدات", // Arabic
    "הצהרות", // Hebrew
    "Olumlamalar", // Turkish
    "Uthibitisho", // Swahili
  ];

  // Rotate through translations
  setInterval(() => {
    currentTranslationIndex = (currentTranslationIndex + 1) % translations.length;
  }, 2000);

  async function handleSubmit() {
    expanded = false; // Start shrinking animation
    const res = await fetch('/api/affirmations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: userInput }),
    });
    const data = await res.json();
    response = data.affirmation.trim();
    await new Promise(resolve => setTimeout(resolve, 400)); // Wait for shrink animation
    inputVisible = false; // Hide input completely
    startTypingAnimation();
  }

  async function startTypingAnimation() {
    typing = true;
    displayedResponse = '';
    await tick(); // Wait for the DOM to update

    for (let i = 0; i < response.length; i++) {
      displayedResponse += response[i];
      await new Promise(resolve => setTimeout(resolve, 20)); // Typing speed
    }
    typing = false;
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter') {
      handleSubmit();
    }
  }
</script>

<style>
  :global(body) {
    margin: 0;
    background-color: black;
    color: white;
    font-family: 'Crimson Text', serif;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    overflow: hidden; /* Prevent scrolling */
    padding: 2rem 0;
  }

  .header {
    position: fixed;
    top: 0;
    width: 100%;
    padding: 2rem 0;
    background: black;
    z-index: 10;
    text-align: center;
  }

  h1 {
    font-family: 'Times New Roman', serif;
    font-size: 4rem;
    margin: 0;
    height: 6rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .translation {
    position: absolute;
    width: 100%;
    text-align: center;
  }

  .content {
    margin-top: 8rem; /* Adjust based on header height */
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
    min-height: calc(100vh - 8rem); /* Ensure full height minus margin */
  }

  .button-container {
    text-align: center;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%; /* Center vertically */
  }

  .plus-button {
    font-size: 3rem;
    color: white;
    border: none;
    background: none;
    cursor: pointer;
    transition:
      transform 0.8s ease,
      opacity 0.5s ease; /* Add opacity transition */
    position: absolute; /* Absolute positioning */
    top: 30%;
    left: 50%;
    transform: translate(-50%, -50%); /* Center the plus button */
  }

  .plus-button:hover {
    transform: translate(-50%, -50%) rotate(405deg);
  }

  .input-box {
    display: flex;
    align-items: center;
    width: 0;
    height: 3rem; /* Match the height of the plus button */
    overflow: hidden;
    transition: width 0.4s ease, opacity 0.4s ease; /* Add opacity transition */
    position: absolute; /* Changed to absolute */
    top: 30%; /* Vertically center */
    left: 50%; /* Horizontally center */
    transform: translate(-50%, -50%); /* Adjust position */
  } 

  .input-box.expanded {
    width: 320px;
    opacity: 1;
  }

  .input-box:not(.expanded) {
    width: 0;
    opacity: 0;
  }

  input {
    padding: 0.5rem;
    font-size: 1.2rem;
    width: 100%;
    border: 2px solid white;
    background: black;
    color: white;
    border-radius: 5px;
    outline: none;
    margin-bottom: 0; /* Remove bottom margin */
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    box-sizing: border-box; /* Include padding and border in the element's total width and height */
  }

  button {
    padding: 0.5rem 1rem;
    font-size: 1rem;
    border: none;
    background: white;
    color: black;
    cursor: pointer;
    border-radius: 5px;
    margin-left: 0.5rem;
  }

  .response-text {
    font-size: 2.5rem; /* Larger text size */
    line-height: 1.4;
    text-align: center;
    max-width: 800px;
    margin: 0 auto;
    padding: 0 2rem;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    opacity: 0;
    animation: fadeIn 0.5s forwards;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
</style>

<div class="header">
  <h1>
    {#key currentTranslationIndex}
      <span 
        class="translation"
        in:fly={{ y: 50, duration: 1000 }}
        out:fly={{ y: -50, duration: 1000 }}
      >
        {translations[currentTranslationIndex]}
      </span>
    {/key}
  </h1>
</div>

<div class="content">
  <div class="button-container">
    {#if !inputVisible && !displayedResponse}
      <button
        class="plus-button"
        on:click={async () => {
          inputVisible = true;
          await tick();
          expanded = true;
        }}>
        +
      </button>
    {:else if inputVisible}
      <div class="input-box {expanded ? 'expanded' : ''}">
        <input
          type="text"
          placeholder="What's on your mind?"
          bind:value={userInput}
          on:keydown={handleKeyDown}
        />
        <button on:click={handleSubmit}>Get Affirmation</button>
      </div>
    {/if}
  </div>

  {#if displayedResponse}
    <p class="response-text" transition:fly={{ y: 20, duration: 800 }}>
      {displayedResponse}
    </p>
  {/if}
</div>