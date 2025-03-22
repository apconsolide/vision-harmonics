
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

interface TimelineEvent {
  id: string;
  timeline_id: string;
  title: string;
  description?: string;
  date: string;
  category?: string;
}

interface Timeline {
  id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
}

interface Node {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    id: string;
    label: string;
    description?: string;
    category?: string;
    size?: string;
    metadata?: Record<string, any>;
  };
}

interface Edge {
  id: string;
  source: string;
  target: string;
  type?: string;
  animated?: boolean;
  markerEnd?: { type: string };
  data?: {
    label?: string;
  };
}

interface VisualizationData {
  nodes: Node[];
  edges: Edge[];
}

serve(async (req) => {
  // Handle CORS for preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { timelines, events } = await req.json();
    
    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not set');
      return new Response(
        JSON.stringify({ 
          error: 'GEMINI_API_KEY is not configured. Please set up the GEMINI_API_KEY environment variable.' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Process data without Gemini if there's not enough data
    if (!timelines?.length || !events?.length) {
      console.log('Not enough data to process with Gemini');
      const visualizationData = processHistoricalDataBasic(timelines || [], events || []);
      return new Response(
        JSON.stringify(visualizationData),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Prepare the data for Gemini
    const prompt = prepareGeminiPrompt(timelines, events);
    
    // Process with Gemini Flash
    const geminiResponse = await processWithGemini(prompt);
    
    // If Gemini processing fails, fallback to basic processing
    if (!geminiResponse) {
      console.log('Fallback to basic processing');
      const visualizationData = processHistoricalDataBasic(timelines, events);
      return new Response(
        JSON.stringify(visualizationData),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Parse the Gemini response and create visualization data
    const visualizationData = parseGeminiResponse(geminiResponse, timelines, events);
    
    return new Response(
      JSON.stringify(visualizationData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error processing historical data:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Prepare the prompt for Gemini
function prepareGeminiPrompt(timelines: Timeline[], events: TimelineEvent[]): string {
  return `
    I have timeline data and events that I want to visualize as a knowledge graph.
    
    Timelines:
    ${JSON.stringify(timelines, null, 2)}
    
    Events:
    ${JSON.stringify(events, null, 2)}
    
    Please analyze this historical data and create:
    1. A set of nodes representing key entities (events, people, places, concepts)
    2. A set of edges representing relationships between these entities
    
    For each node, include:
    - id: a unique identifier
    - type: "event", "person", "concept", etc.
    - position: {x, y} coordinates (just placeholder values)
    - data: containing label, description, category, and any metadata
    
    For each edge, include:
    - id: a unique identifier
    - source: the id of the source node
    - target: the id of the target node
    - type: "timeline", "dashed", or "glowing"
    - data: containing a label describing the relationship
    
    Please identify important relationships beyond just timeline connections.
    Also extract any key people, places, or concepts mentioned in the event descriptions.
    Return a JSON object with "nodes" and "edges" arrays.
  `;
}

// Process with Gemini Flash
async function processWithGemini(prompt: string): Promise<string | null> {
  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 8192,
        }
      }),
    });

    if (!response.ok) {
      console.error(`Gemini API error: ${response.status} ${response.statusText}`);
      const errorData = await response.json();
      console.error('Error details:', errorData);
      return null;
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      console.error('Unexpected response format from Gemini API');
      console.error('Response:', JSON.stringify(data, null, 2));
      return null;
    }
    
    const generatedText = data.candidates[0].content.parts[0].text;
    return generatedText;
    
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return null;
  }
}

// Parse the Gemini response
function parseGeminiResponse(response: string, timelines: Timeline[], events: TimelineEvent[]): VisualizationData {
  try {
    // Extract the JSON object from the response text
    const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || 
                     response.match(/```\n([\s\S]*?)\n```/) ||
                     response.match(/(\{[\s\S]*\})/);
                     
    if (jsonMatch && jsonMatch[1]) {
      const jsonStr = jsonMatch[1].trim();
      const parsed = JSON.parse(jsonStr);
      
      if (parsed.nodes && parsed.edges) {
        return parsed as VisualizationData;
      }
    }
    
    // If we couldn't extract properly formatted JSON, fallback to basic processing
    console.log('Could not parse Gemini response, falling back to basic processing');
    return processHistoricalDataBasic(timelines, events);
    
  } catch (error) {
    console.error('Error parsing Gemini response:', error);
    return processHistoricalDataBasic(timelines, events);
  }
}

// Basic data processing without Gemini
function processHistoricalDataBasic(timelines: Timeline[], events: TimelineEvent[]): VisualizationData {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  
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
        size: 'large'
      }
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
          category: event.category || 'historical'
        }
      }
    });
    
    // Connect events to their timelines
    if (event.timeline_id) {
      edges.push({
        id: `edge-timeline-${event.timeline_id}-event-${event.id}`,
        source: `timeline-${event.timeline_id}`,
        target: `event-${event.id}`,
        type: 'timeline',
        animated: true,
        markerEnd: {
          type: 'arrowclosed'
        },
        data: {
          label: 'contains'
        }
      });
    }
  });
  
  // Connect events chronologically within the same timeline
  const eventsByTimeline: Record<string, TimelineEvent[]> = {};
  
  events.forEach((event) => {
    if (!event.timeline_id) return;
    
    if (!eventsByTimeline[event.timeline_id]) {
      eventsByTimeline[event.timeline_id] = [];
    }
    
    eventsByTimeline[event.timeline_id].push(event);
  });
  
  // Sort events by date and create chronological connections
  Object.values(eventsByTimeline).forEach((timelineEvents) => {
    timelineEvents.sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateA - dateB;
    });
    
    for (let i = 0; i < timelineEvents.length - 1; i++) {
      edges.push({
        id: `edge-chrono-${timelineEvents[i].id}-${timelineEvents[i+1].id}`,
        source: `event-${timelineEvents[i].id}`,
        target: `event-${timelineEvents[i+1].id}`,
        type: 'dashed',
        animated: true,
        data: {
          label: 'followed by'
        }
      });
    }
  });
  
  return { nodes, edges };
}
