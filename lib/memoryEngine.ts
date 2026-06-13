// lib/memoryEngine.ts
// Persistent AI memory system using Supabase
// extractMemories(): uses Groq to pull facts from conversation and save them
// fetchMemoryContext(): returns a formatted string to inject into Nia's system prompt

import Groq from 'groq-sdk';
import { supabase } from './supabaseClient';

const MEMORY_EXTRACT_PROMPT = `You are a memory extractor for an AI shopping assistant.
Given a user message and AI response, extract any PERSONAL FACTS, PREFERENCES, DIETARY RESTRICTIONS, or HABITS mentioned.
Return ONLY a JSON array of short strings. Example: ["User likes spicy food", "User is allergic to peanuts", "User's mom lives in Andheri West"].
If nothing personal was mentioned, return an empty array [].
Do NOT include generic shopping info — only personal facts about the user.`;

export async function extractAndSaveMemories(
  userId: string,
  userMessage: string,
  niaResponse: string
): Promise<void> {
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const result = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: MEMORY_EXTRACT_PROMPT },
        {
          role: 'user',
          content: `User said: "${userMessage}"\nNia replied: "${niaResponse}"`,
        },
      ],
      max_tokens: 200,
      temperature: 0.1,
    });

    const raw = result.choices[0]?.message?.content ?? '[]';
    // Parse the JSON array from response (avoid /s flag for ES2017 compat)
    const startIdx = raw.indexOf('[');
    const endIdx = raw.lastIndexOf(']');
    if (startIdx === -1 || endIdx <= startIdx) return;

    const memories: string[] = JSON.parse(raw.slice(startIdx, endIdx + 1));
    if (!memories.length) return;

    // Save each memory to Supabase
    const inserts = memories.map((memory) => ({ user_id: userId, memory }));
    await supabase.from('ai_memories').insert(inserts);
  } catch (err) {
    // Non-critical — silently fail
    console.warn('Memory extraction failed:', err);
  }
}

export async function fetchMemoryContext(userId: string): Promise<string> {
  const { data, error } = await supabase
    .from('ai_memories')
    .select('memory')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error || !data?.length) return '';

  const memories = data.map((d) => `- ${d.memory}`).join('\n');
  return `WHAT NIA KNOWS ABOUT THIS USER:\n${memories}`;
}

export async function fetchUserAddresses(userId: string) {
  const { data } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', userId);
  return data ?? [];
}

export async function resolveAddress(userId: string, label: string) {
  const { data } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', userId)
    .ilike('label', `%${label}%`)
    .limit(1)
    .single();
  return data ?? null;
}
