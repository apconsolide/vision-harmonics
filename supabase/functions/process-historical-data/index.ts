
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get request data
    const { timelines, events } = await req.json();
    
    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    if (!GEMINI_API_KEY) {
      // Return simple visualization if no API key is available
      const simpleVisualization = generateSimpleVisualization(timelines, events);
      return new Response(JSON.stringify(simpleVisualization), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }
    
    // Process data with Gemini
    const prompt = generateGeminiPrompt(timelines, events);
    const geminiResponse = await fetchGeminiResponse(prompt);
    
    // Parse Gemini response and generate visualization
    const visualization = processGeminiResponse(geminiResponse, timelines, events);
    
    return new Response(JSON.stringify(visualization), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
    
  } catch (error) {
    console.error('Error processing historical data:', error);
    
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

// Generate prompt for Gemini
function generateGeminiPrompt(timelines: any[], events: any[]) {
  return `
    Analyze these historical timelines and events. Identify key relationships, connections, and patterns:
    
    Timelines: ${JSON.stringify(timelines)}
    
    Events: ${JSON.stringify(events)}
    
    Generate a knowledge graph representation with the following:
    1. Identify main entities (people, places, events, concepts)
    2. Establish relationships between these entities
    3. Find patterns or cause-effect relationships
    4. Determine importance of each entity
    
    Format your response as a JSON object with 'nodes' and 'edges' arrays that follow this structure:
    {
      "nodes": [
        {
          "id": "unique-id",
          "type": "concept|event|person|place",
          "position": {"x": number, "y": number},
          "data": {
            "id": "unique-id",
            "label": "Entity name",
            "description": "Brief description",
            "category": "Category name",
            "size": "small|medium|large",
            "metadata": { "date": "YYYY-MM-DD", "importance": number }
          }
        }
      ],
      "edges": [
        {
          "id": "edge-1",
          "source": "source-node-id",
          "target": "target-node-id",
          "type": "default|dashed|glowing|timeline",
          "animated": true|false,
          "data": { "label": "relationship name" }
        }
      ]
    }
  `;
}

// Fetch response from Gemini API
async function fetchGeminiResponse(prompt: string) {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return '';
  }
}

// Process Gemini response to extract visualization data
function processGeminiResponse(geminiResponse: string, timelines: any[], events: any[]) {
  try {
    // Try to extract JSON from the response
    const jsonMatch = geminiResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const jsonData = JSON.parse(jsonMatch[0]);
      return jsonData;
    }
  } catch (error) {
    console.error('Error parsing Gemini response:', error);
  }
  
  // Fallback to simple visualization if parsing fails
  return generateSimpleVisualization(timelines, events);
}

// Generate simple visualization without AI
function generateSimpleVisualization(timelines: any[], events: any[]) {
  const nodes = [];
  const edges = [];
  
  // Create timeline nodes
  timelines.forEach((timeline, index) => {
    nodes.push({
      id: `timeline-${timeline.id}`,
      type: 'concept',
      position: { x: 100, y: 100 + index * 200 },
      data: {
        id: `timeline-${timeline.id}`,
        label: timeline.title || 'Timeline',
        description: timeline.description || '',
        category: 'primary',
        size: 'large',
      },
    });
  });
  
  // Create event nodes
  events.forEach((event, index) => {
    const eventDate = event.date ? new Date(event.date) : null;
    const formattedDate = eventDate ? eventDate.toLocaleDateString() : '';
    
    nodes.push({
      id: `event-${event.id}`,
      type: 'event',
      position: { x: 400 + (index % 3) * 200, y: 100 + Math.floor(index / 3) * 150 },
      data: {
        id: `event-${event.id}`,
        label: event.title || 'Event',
        description: event.description || '',
        category: 'event',
        size: 'medium',
        metadata: {
          date: formattedDate,
          category: event.category || 'historical',
        },
      },
    });
    
    // Connect events to their timelines
    if (event.timeline_id) {
      edges.push({
        id: `edge-timeline-${event.timeline_id}-event-${event.id}`,
        source: `timeline-${event.timeline_id}`,
        target: `event-${event.id}`,
        type: 'timeline',
        animated: true,
        data: {
          label: 'contains',
        },
      });
    }
  });
  
  return { nodes, edges };
}
