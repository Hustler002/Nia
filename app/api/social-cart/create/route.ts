// app/api/social-cart/create/route.ts
// Creates a new social cart session, returns the shareable code

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

function generateCode(length = 6): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function POST(req: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  try {
    const { name, hostId, hostName } = await req.json();

    if (!name || !hostId || !hostName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Generate a unique code
    let code = generateCode();
    let attempts = 0;
    while (attempts < 5) {
      const { data } = await supabase
        .from('social_carts')
        .select('code')
        .eq('code', code)
        .single();
      if (!data) break;
      code = generateCode();
      attempts++;
    }

    const { data: cart, error } = await supabase
      .from('social_carts')
      .insert({ code, name, host_id: hostId, host_name: hostName })
      .select()
      .single();

    if (error || !cart) {
      return NextResponse.json({ error: error?.message || 'Failed to create cart' }, { status: 500 });
    }

    // Auto-join the host as first member
    await supabase.from('social_cart_members').insert({
      cart_code: code,
      user_id: hostId,
      name: hostName,
      avatar_color: '#FF9900',
    });

    return NextResponse.json({ cart, code });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
