// app/seller/api/insights/route.ts
// Server route: fetches last 30 days of orders → sends to Groq → returns AI-generated insights

import { Groq } from 'groq-sdk';
import { getTopProducts, getRevenueByDay, getDemandByPincode, getSummaryStats } from '@/lib/seller/analytics';

export async function GET() {
  try {
    const [stats, topProducts, revenueByDay, demandByPin] = await Promise.all([
      getSummaryStats(),
      getTopProducts(),
      getRevenueByDay(),
      getDemandByPincode(),
    ]);

    // Build a concise data summary for Groq
    const dataSummary = `
SALES DATA SUMMARY (Last 30 days):
- Total Revenue: ₹${stats.totalRevenue}
- Total Orders: ${stats.totalOrders}
- Orders Today: ${stats.todayOrders}
- Average Order Value: ₹${stats.avgOrderValue}

TOP PRODUCTS (by units sold):
${topProducts.slice(0, 5).map((p, i) => `${i + 1}. ${p.name} — ${p.units} units, ₹${p.revenue} revenue`).join('\n')}

TOP PINCODES (by orders):
${demandByPin.slice(0, 5).map((p) => `- ${p.pincode}: ${p.orders} orders, ₹${p.revenue} revenue`).join('\n')}
    `.trim();

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const result = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are a smart retail analytics assistant for Amazon Now (a 10-minute delivery platform in India).
Generate exactly 3 short, actionable insights for the seller based on the data provided.
Format: JSON array of objects like [{"title": "...", "body": "...", "type": "opportunity|warning|info"}].
Keep each insight to 1-2 sentences. Be specific with numbers. Focus on actionable recommendations.`,
        },
        { role: 'user', content: dataSummary },
      ],
      max_tokens: 400,
      temperature: 0.4,
    });

    const raw = result.choices[0]?.message?.content ?? '[]';
    const startIdx = raw.indexOf('[');
    const endIdx = raw.lastIndexOf(']');
    const insights = (startIdx !== -1 && endIdx > startIdx)
      ? JSON.parse(raw.slice(startIdx, endIdx + 1))
      : [];

    return Response.json({ stats, topProducts, revenueByDay, demandByPin, insights });
  } catch (err: any) {
    console.error('Seller insights error:', err?.message || err);
    return Response.json({
      stats: { totalRevenue: 0, totalOrders: 0, todayOrders: 0, avgOrderValue: 0 },
      topProducts: [],
      revenueByDay: [],
      demandByPin: [],
      insights: [
        { title: 'No data yet', body: 'Place some orders first to see analytics here.', type: 'info' },
      ],
    });
  }
}
