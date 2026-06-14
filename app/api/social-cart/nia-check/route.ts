// app/api/social-cart/nia-check/route.ts
// Asks Nia to check if a newly added item conflicts with any member's known preferences/allergies

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

interface MemberRef {
  id: string;
  name: string;
}

export async function POST(req: NextRequest) {
  try {
    const { itemId, itemName, cartCode, addedByName, members } = await req.json() as {
      itemId: string;
      itemName: string;
      cartCode: string;
      addedByName: string;
      members: MemberRef[];
    };

    if (!supabase || !itemId || !itemName || !members?.length) {
      return NextResponse.json({ checked: false });
    }

    // Fetch memories for all members
    const memberIds = members.map((m) => m.id);
    const { data: memories } = await supabase
      .from('nia_memories')
      .select('user_id, memory')
      .in('user_id', memberIds);

    if (!memories || memories.length === 0) {
      return NextResponse.json({ checked: true, flagged: false });
    }

    // Build context string
    const memberMemoryContext = members.map((m) => {
      const memberMemories = memories
        .filter((mem) => mem.user_id === m.id)
        .map((mem) => mem.memory)
        .join('; ');
      return memberMemories ? `${m.name}: ${memberMemories}` : null;
    }).filter(Boolean).join('\n');

    if (!memberMemoryContext) {
      return NextResponse.json({ checked: true, flagged: false });
    }

    // Ask Nia
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: `You are Nia, an AI shopping assistant. You are checking if a newly added cart item is safe and appropriate for all members of a shared cart, based on their known preferences, allergies, or dietary restrictions.

Respond ONLY with valid JSON in this format:
{
  "flagged": true/false,
  "reason": "Short reason if flagged, null if not flagged"
}

Be conservative — only flag if there is a clear, specific conflict like a known allergy or strong dietary restriction. Do NOT flag for mild preferences.`,
        },
        {
          role: 'user',
          content: `${addedByName} just added "${itemName}" to a shared cart.

Member profiles:
${memberMemoryContext}

Is there any conflict? Respond with JSON only.`,
        },
      ],
      temperature: 0.1,
      max_tokens: 100,
    });

    const raw = completion.choices[0]?.message?.content?.trim() || '{"flagged":false,"reason":null}';

    let result: { flagged: boolean; reason: string | null } = { flagged: false, reason: null };
    try {
      // Extract JSON from the response
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) result = JSON.parse(match[0]);
    } catch {
      // Parse failed — assume no flag
    }

    // If flagged, update the item in the DB so Realtime broadcasts it
    if (result.flagged && result.reason) {
      await supabase
        .from('social_cart_items')
        .update({ flagged_by_nia: true, nia_flag_reason: result.reason })
        .eq('id', itemId);
    }

    return NextResponse.json({ checked: true, flagged: result.flagged, reason: result.reason });
  } catch (err) {
    console.error('Nia check error:', err);
    return NextResponse.json({ checked: false });
  }
}
