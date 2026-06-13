// Bedrock Agent action groups formatted for OpenAI / Groq tool calling

export const TOOL_DEFINITIONS = [
  {
    type: "function",
    function: {
      name: "search_catalog",
      description: "Semantic search over the product catalog. Use for any product discovery query.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string" },
          filters: {
            type: "object",
            properties: {
              category: { type: "string" },
              maxPrice: { type: "number" },
              minRating: { type: "number" },
              inStockOnly: { type: "boolean" }
            }
          }
        },
        required: ["query"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "compare_products",
      description: "Compare 2-4 products on price, specs, ratings, and delivery ETA.",
      parameters: {
        type: "object",
        properties: {
          product_ids: { type: "array", items: { type: "string" } },
          attributes: { type: "array", items: { type: "string" } }
        },
        required: ["product_ids"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "build_cart",
      description: "Build a complete cart from a natural-language intent. Decomposes the intent into product categories, selects best items per category.",
      parameters: {
        type: "object",
        properties: {
          intent: { type: "string" },
          constraints: {
            type: "object",
            properties: {
              maxTotal: { type: "number" },
              servings: { type: "number" },
              occasion: { type: "string" },
              dietary: { type: "array", items: { type: "string" } }
            }
          }
        },
        required: ["intent"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "check_inventory_eta",
      description: "Check real-time stock and delivery ETA from dark stores near a pincode.",
      parameters: {
        type: "object",
        properties: {
          product_ids: { type: "array", items: { type: "string" } },
          pincode: { type: "string" }
        },
        required: ["product_ids", "pincode"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_user_profile",
      description: "Fetch user preferences, dietary info, and purchase history for personalization.",
      parameters: {
        type: "object",
        properties: {
          user_id: { type: "string" }
        },
        required: ["user_id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "track_order",
      description: "Get current order status and ETA. Use order_id if known, else last order.",
      parameters: {
        type: "object",
        properties: {
          order_id: { type: "string" },
          user_id: { type: "string" }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "apply_substitution",
      description: "Find the best substitute for an out-of-stock or unsuitable product.",
      parameters: {
        type: "object",
        properties: {
          product_id: { type: "string" },
          reason: { type: "string" }
        },
        required: ["product_id", "reason"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "generate_emergency_kit",
      description: "Assemble a pre-curated emergency kit for a given category and location. Prioritize fastest-available items.",
      parameters: {
        type: "object",
        properties: {
          category: { 
            type: "string", 
            enum: ['baby_care', 'fever_illness', 'surprise_guests', 'tech_rescue', 'kitchen_mishap', 'period_care', 'pet_emergency']
          },
          pincode: { type: "string" },
          adult_count: { type: "number" }
        },
        required: ["category", "pincode"]
      }
    }
  }
];
