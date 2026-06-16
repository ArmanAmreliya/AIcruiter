async function listFreeModels() {
  try {
    const res = await fetch('https://openrouter.ai/api/v1/models');
    if (!res.ok) throw new Error('Failed to fetch models');
    const data = await res.json();
    const freeModels = data.data.filter(m => {
      const isPromptFree = parseFloat(m.pricing.prompt) === 0;
      const isCompletionFree = parseFloat(m.pricing.completion) === 0;
      return isPromptFree && isCompletionFree;
    });
    console.log('Found', freeModels.length, 'free models:');
    freeModels.forEach(m => {
      console.log(`- ${m.id} (${m.name}): Context ${m.context_length}`);
    });
  } catch (err) {
    console.error('Error listing free models:', err);
  }
}

listFreeModels();
