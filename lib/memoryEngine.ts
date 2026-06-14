// lib/memoryEngine.ts
// Persistent AI memory system using Supabase
// extractMemories(): uses Groq to pull facts from conversation and save them
// fetchMemoryContext(): returns a formatted string to inject into Nia's system prompt
// All functions gracefully no-op if Supabase is not configured.

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
  if (!supabase) return; // Supabase not configured yet
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const result = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
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
  if (!supabase) return '';

  let context = '';

  // 1. Fetch persistent extracted memories
  const { data: memoriesData } = await supabase
    .from('ai_memories')
    .select('memory')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (memoriesData && memoriesData.length > 0) {
    const memories = memoriesData.map((d) => `- ${d.memory}`).join('\n');
    context += `WHAT NIA KNOWS ABOUT THIS USER:\n${memories}\n\n`;
  }

  // 2. Fetch recent orders for real-time history
  const { data: ordersData } = await supabase
    .from('orders')
    .select('id, items, total, placed_at')
    .eq('user_id', userId)
    .order('placed_at', { ascending: false })
    .limit(5);

  if (ordersData && ordersData.length > 0) {
    const ordersStr = ordersData.map((o: any) => {
      const itemNames = o.items.map((i: any) => `${i.qty}x ${i.name}`).join(', ');
      return `- Order on ${new Date(o.placed_at).toLocaleDateString()}: ${itemNames} (Total: ₹${o.total})`;
    }).join('\n');
    context += `RECENT ORDER HISTORY:\n${ordersStr}\n`;
  }

  return context.trim();
}

export async function fetchUserAddresses(userId: string) {
  if (!supabase) return [];

  const { data } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', userId);
  return data ?? [];
}

export async function resolveAddress(userId: string, label: string) {
  if (!supabase) return null;

  const { data } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', userId)
    .ilike('label', `%${label}%`)
    .limit(1)
    .single();
  return data ?? null;
}
