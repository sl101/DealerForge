export async function generateTaskImage(prompt: string): Promise<string | null> {
  // На этом этапе мы будем использовать render компонент Grok Imagine
  // Для Vercel мы можем сохранить промпт и показывать его, а позже подключить API
  console.log("Image prompt generated:", prompt);
  return prompt; // пока возвращаем промпт
}