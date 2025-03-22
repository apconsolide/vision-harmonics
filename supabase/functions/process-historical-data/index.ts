
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
    const { timelines, events, userText } = await req.json();
    
    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    if (!GEMINI_API_KEY) {
      // Return simple visualization if no API key is available
      const simpleVisualization = userText 
        ? generateSimpleVisualizationFromText(userText)
        : generateSimpleVisualization(timelines, events);
      return new Response(JSON.stringify(simpleVisualization), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }
    
    // Process data with Gemini
    const prompt = userText 
      ? generateGeminiPromptFromText(userText)
      : generateGeminiPrompt(timelines, events);
    
    const geminiResponse = await fetchGeminiResponse(prompt);
    
    // Parse Gemini response and generate visualization
    const visualization = processGeminiResponse(geminiResponse, timelines, events, userText);
    
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

// Generate prompt for Gemini from user text input
function generateGeminiPromptFromText(userText: string) {
  return `
    Analyze this historical text and extract key entities, events, people, places, concepts, and relationships:
    
    ${userText}
    
    Generate a knowledge graph representation with the following:
    1. Identify main entities (people, places, events, concepts)
    2. Establish relationships between these entities
    3. Find patterns or cause-effect relationships
    4. Determine importance of each entity
    5. Extract any dates or time periods mentioned
    
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
function processGeminiResponse(geminiResponse: string, timelines: any[], events: any[], userText?: string) {
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
  if (userText) {
    return generateSimpleVisualizationFromText(userText);
  }
  return generateSimpleVisualization(timelines, events);
}

// Generate simple visualization from text input without AI
function generateSimpleVisualizationFromText(text: string) {
  const nodes = [];
  const edges = [];
  
  // Extract potential entities using basic text analysis
  // This is a very simple approach - just to demonstrate fallback functionality
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  // Create a main concept node for the text
  nodes.push({
    id: 'main-concept',
    type: 'concept',
    position: { x: 300, y: 300 },
    data: {
      id: 'main-concept',
      label: 'Main Topic',
      description: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
      category: 'primary',
      size: 'large',
    },
  });
  
  // Simple entity extraction (people, places, events)
  const entityTypes = [
    { pattern: /(in|at|on|during) (\d{4})/gi, type: 'event' },
    { pattern: /([A-Z][a-z]+ [A-Z][a-z]+)/g, type: 'person' }, // Simple name detection
  ];
  
  const foundEntities = new Set();
  
  sentences.forEach((sentence, idx) => {
    if (idx < 15) { // Limit to prevent too many nodes
      // Check for dates - potential events
      const dateMentions = sentence.match(/\b\d{4}\b/g); // Find years
      if (dateMentions) {
        dateMentions.forEach((year, yearIdx) => {
          if (!foundEntities.has(year) && yearIdx < 3) { // Avoid duplicates and too many of the same type
            foundEntities.add(year);
            const nodeId = `event-${nodes.length}`;
            nodes.push({
              id: nodeId,
              type: 'event',
              position: { x: 500 + (idx * 50), y: 200 + (yearIdx * 100) },
              data: {
                id: nodeId,
                label: `Event in ${year}`,
                description: sentence.substring(0, 100) + (sentence.length > 100 ? '...' : ''),
                category: 'event',
                size: 'medium',
                metadata: {
                  date: year
                }
              }
            });
            
            edges.push({
              id: `edge-main-${nodeId}`,
              source: 'main-concept',
              target: nodeId,
              type: 'timeline',
              animated: true,
              data: {
                label: 'occurred in'
              }
            });
          }
        });
      }
      
      // Check for potential people names (simplified)
      const names = sentence.match(/(?:[A-Z][a-z]+ ){1,2}[A-Z][a-z]+/g);
      if (names) {
        names.forEach((name, nameIdx) => {
          if (!foundEntities.has(name) && nameIdx < 2) {
            foundEntities.add(name);
            const nodeId = `person-${nodes.length}`;
            nodes.push({
              id: nodeId,
              type: 'person',
              position: { x: 150 + (idx * 30), y: 400 + (nameIdx * 80) },
              data: {
                id: nodeId,
                label: name,
                description: `Mentioned in context: "${sentence.substring(0, 50)}..."`,
                category: 'person',
                size: 'medium'
              }
            });
            
            edges.push({
              id: `edge-main-${nodeId}`,
              source: 'main-concept',
              target: nodeId,
              type: 'default',
              animated: false,
              data: {
                label: 'involves'
              }
            });
          }
        });
      }
      
      // Extract concepts (nouns preceded by "the")
      const concepts = sentence.match(/the ([A-Z][a-z]+|[a-z]+)/g);
      if (concepts) {
        concepts.forEach((conceptPhrase, conceptIdx) => {
          const concept = conceptPhrase.replace('the ', '');
          if (!foundEntities.has(concept) && conceptIdx < 2 && concept.length > 4) {
            foundEntities.add(concept);
            const nodeId = `concept-${nodes.length}`;
            nodes.push({
              id: nodeId,
              type: 'concept',
              position: { x: 350 + (conceptIdx * 100), y: 100 + (idx * 40) },
              data: {
                id: nodeId,
                label: concept,
                category: 'secondary',
                size: 'small'
              }
            });
            
            edges.push({
              id: `edge-concept-${nodeId}`,
              source: 'main-concept',
              target: nodeId,
              type: 'dashed',
              data: {
                label: 'includes'
              }
            });
          }
        });
      }
    }
  });
  
  return { nodes, edges };
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

