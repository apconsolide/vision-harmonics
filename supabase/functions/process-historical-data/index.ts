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
    حلل هذا النص التاريخي واستخرج الكيانات الرئيسية والأحداث والأشخاص والأماكن والمفاهيم والتواريخ والعلاقات:

    ${userText}

    قم بإنشاء تمثيل بياني للمعرفة (knowledge graph) بالخصائص التالية:
    1. حدد الكيانات الرئيسية مع أنواع محددة:
       - الأشخاص (شخصيات تاريخية ، مجموعات)
       - الأماكن (المواقع والبلدان والمدن)
       - الأحداث (المعارك والمعاهدات والثورات)
       - المفاهيم (الأفكار والحركات والنظريات)
       - الوثائق (المعاهدات والدساتير والكتب)
       - التواريخ (سنوات محددة وفترات زمنية وعصور)

    2. قم بإنشاء علاقات بين هذه الكيانات:
       - العلاقات السببية (نتج عن ، تسبب فيه)
       - العلاقات الزمنية (قبل ، بعد ، أثناء)
       - العلاقات المكانية (تقع في ، سافر إلى)
       - العلاقات الاجتماعية (متحالف مع ، يعارض)
       - العلاقات المفاهيمية (متأثر بـ ، جزء من)

    3. حدد الأهمية والسياق:
       - قم بتعيين درجات الأهمية (1-10) للكيانات
       - استخرج جميع التواريخ والفترات الزمنية المذكورة
       - حدد الموضوعات والأنماط الرئيسية

    قم بتنسيق ردك ككائن JSON مع مصفوفات 'nodes' و 'edges' تتبع هذا الهيكل:
    {
      "nodes": [
        {
          "id": "unique-id",
          "type": "concept|event|person|document|place|date",
          "position": {"x": number, "y": number},
          "data": {
            "id": "unique-id",
            "label": "Entity name",
            "description": "Brief description",
            "category": "Category name",
            "size": "small|medium|large",
            "entityType": "concept|event|person|document|place|date",
            "metadata": { 
              "date": "YYYY-MM-DD", 
              "importance": number,
              "era": "string",
              "location": "string" 
            }
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
          "data": { 
            "label": "relationship name",
            "strength": number,
            "type": "causal|temporal|spatial|social|conceptual"
          }
        }
      ]
    }

    تأكد من أن أنواع الكيانات تطابق نوع التصور المناسب لها. على سبيل المثال:
    - الأشخاص يجب أن يكون نوعهم "person"
    - الأحداث يجب أن يكون نوعها "event"
    - الأماكن يجب أن يكون نوعها "place"
    - المفاهيم يجب أن يكون نوعها "concept"
    - الوثائق يجب أن يكون نوعها "document"
    - التواريخ / السنوات يجب أن يكون نوعها "date"

    ضع العقد في تخطيط منطقي (الأشخاص بالقرب من الأحداث ذات الصلة ، والأماكن بالقرب من الأحداث التي وقعت فيها ، وما إلى ذلك).
  `;
}

// Generate prompt for Gemini
function generateGeminiPrompt(timelines: any[], events: any[]) {
  return `
    حلل هذه الجداول الزمنية والأحداث التاريخية. حدد العلاقات والاتصالات والأنماط الرئيسية:

    الجداول الزمنية: ${JSON.stringify(timelines)}

    الأحداث: ${JSON.stringify(events)}

    قم بإنشاء تمثيل بياني للمعرفة (knowledge graph) بالخصائص التالية:
    1. حدد الكيانات الرئيسية مع أنواع محددة:
       - الأشخاص (شخصيات تاريخية ، مجموعات)
       - الأماكن (المواقع والبلدان والمدن)
       - الأحداث (المعارك والمعاهدات والثورات)
       - المفاهيم (الأفكار والحركات والنظريات)
       - الوثائق (المعاهدات والدساتير والكتب)
       - التواريخ (سنوات محددة وفترات زمنية وعصور)

    2. قم بإنشاء علاقات بين هذه الكيانات:
       - العلاقات السببية (نتج عن ، تسبب فيه)
       - العلاقات الزمنية (قبل ، بعد ، أثناء)
       - العلاقات المكانية (تقع في ، سافر إلى)
       - العلاقات الاجتماعية (متحالف مع ، يعارض)
       - العلاقات المفاهيمية (متأثر بـ ، جزء من)

    3. حدد الأهمية والسياق:
       - قم بتعيين درجات الأهمية (1-10) للكيانات
       - حدد الموضوعات والأنماط الرئيسية

    قم بتنسيق ردك ككائن JSON مع مصفوفات 'nodes' و 'edges' تتبع هذا الهيكل:
    {
      "nodes": [
        {
          "id": "unique-id",
          "type": "concept|event|person|document|place|date",
          "position": {"x": number, "y": number},
          "data": {
            "id": "unique-id",
            "label": "Entity name",
            "description": "Brief description",
            "category": "Category name",
            "size": "small|medium|large",
            "entityType": "concept|event|person|document|place|date",
            "metadata": { 
              "date": "YYYY-MM-DD", 
              "importance": number,
              "era": "string",
              "location": "string" 
            }
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
          "data": { 
            "label": "relationship name",
            "strength": number,
            "type": "causal|temporal|spatial|social|conceptual"
          }
        }
      ]
    }

    تأكد من أن أنواع الكيانات تطابق نوع التصور المناسب لها. على سبيل المثال:
    - الأشخاص يجب أن يكون نوعهم "person"
    - الأحداث يجب أن يكون نوعها "event"
    - الأماكن يجب أن يكون نوعها "place"
    - المفاهيم يجب أن يكون نوعها "concept"
    - الوثائق يجب أن يكون نوعها "document"
    - التواريخ / السنوات يجب أن يكون نوعها "date"

    ضع العقد في تخطيط منطقي (الأشخاص بالقرب من الأحداث ذات الصلة ، والأماكن بالقرب من الأحداث التي وقعت فيها ، وما إلى ذلك).
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
      
      // Ensure all nodes have appropriate types mapped to correct visualization components
      if (jsonData.nodes) {
        jsonData.nodes = jsonData.nodes.map((node: any) => {
          // Make sure the node type matches a defined node type in our front-end
          if (!node.type || !['concept', 'event', 'person', 'document', 'place', 'date'].includes(node.type)) {
            // Default to concept if type is missing or invalid
            node.type = 'concept';
          }
          
          // Ensure data.entityType matches node.type for consistent rendering
          if (node.data) {
            node.data.entityType = node.type;
          }
          
          return node;
        });
      }
      
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
      entityType: 'concept'
    },
  });
  
  // Extract potential entities using basic text analysis
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const foundEntities = new Set();
  
  // Extract dates (years, specific dates)
  const datePattern = /\b(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\d{4}s?|\d{1,2}(st|nd|rd|th) century|[A-Z][a-z]+ \d{1,2},? \d{4})\b/g;
  const dates = text.match(datePattern) || [];
  
  dates.forEach((date, idx) => {
    if (!foundEntities.has(date) && idx < 5) {
      foundEntities.add(date);
      const nodeId = `date-${nodes.length}`;
      nodes.push({
        id: nodeId,
        type: 'date',
        position: { x: 500 + (idx * 50), y: 200 },
        data: {
          id: nodeId,
          label: date,
          category: 'date',
          size: 'small',
          entityType: 'date'
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
  
  // Extract potential events (sentences with action verbs and dates)
  const eventIndicators = [
    /\b(war|battle|revolution|treaty|election|coronation|assassination|inauguration|invasion|discovered|founded|established|signed|declared|launched|started|began|ended)\b/i
  ];
  
  sentences.forEach((sentence, idx) => {
    if (idx < 10) {
      for (const pattern of eventIndicators) {
        if (pattern.test(sentence)) {
          // It's likely an event
          const nodeId = `event-${nodes.length}`;
          const eventTitle = sentence.length > 40 ? sentence.substring(0, 40) + "..." : sentence;
          
          // Check if this sentence also contains a date
          const sentenceDates = sentence.match(datePattern);
          const dateStr = sentenceDates ? sentenceDates[0] : '';
          
          if (!foundEntities.has(eventTitle)) {
            foundEntities.add(eventTitle);
            nodes.push({
              id: nodeId,
              type: 'event',
              position: { x: 450 + (idx * 30), y: 350 },
              data: {
                id: nodeId,
                label: eventTitle,
                description: sentence,
                category: 'event',
                size: 'medium',
                entityType: 'event',
                metadata: {
                  date: dateStr
                }
              }
            });
            
            edges.push({
              id: `edge-main-${nodeId}`,
              source: 'main-concept',
              target: nodeId,
              type: dateStr ? 'timeline' : 'default',
              animated: true,
              data: {
                label: 'includes'
              }
            });
            
            // If there's a date associated with this event and we've already created a date node,
            // connect them
            if (dateStr && foundEntities.has(dateStr)) {
              const dateNodeId = Array.from(nodes).find((n: any) => n.data.label === dateStr)?.id;
              if (dateNodeId) {
                edges.push({
                  id: `edge-${dateNodeId}-${nodeId}`,
                  source: dateNodeId,
                  target: nodeId,
                  type: 'timeline',
                  animated: false,
                  data: {
                    label: 'occurred on'
                  }
                });
              }
            }
            
            break; // We've used this sentence as an event
          }
        }
      }
    }
  });
  
  // Extract people (common name patterns)
  const peoplePatterns = [
    /\b(?:[A-Z][a-z]+ ){1,2}[A-Z][a-z]+\b/g,  // Basic name pattern like "John Smith"
    /\b(?:President|King|Queen|Emperor|General|Dr\.|Prime Minister) [A-Z][a-z]+(?: [A-Z][a-z]+)?\b/g  // Titles with names
  ];
  
  peoplePatterns.forEach(pattern => {
    const peopleMatches = text.match(pattern) || [];
    peopleMatches.forEach((person, idx) => {
      if (!foundEntities.has(person) && idx < 5) {
        foundEntities.add(person);
        const nodeId = `person-${nodes.length}`;
        nodes.push({
          id: nodeId,
          type: 'person',
          position: { x: 150 + (idx * 50), y: 400 },
          data: {
            id: nodeId,
            label: person,
            category: 'person',
            size: 'medium',
            entityType: 'person'
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
  });
  
  // Extract places (common place name patterns)
  const placePatterns = [
    /\b(?:in|at|to|from) ([A-Z][a-z]+(?:[ -][A-Z][a-z]+)*)\b/g,  // Prepositions often indicate places
    /\b(North|South|East|West) [A-Z][a-z]+\b/g,  // Directions with places
    /\b(?:America|Africa|Europe|Asia|Australia|Antarctica)\b/g,  // Continents
    /\b(?:Republic|Kingdom|Empire|State|Nation|Country) of [A-Z][a-z]+(?:[ -][A-Z][a-z]+)*\b/g  // Political entities
  ];
  
  placePatterns.forEach(pattern => {
    let match;
    // Need to use exec for pattern matches with capturing groups
    while ((match = pattern.exec(text)) !== null) {
      const place = match[1] || match[0]; // Use capturing group if available
      if (!foundEntities.has(place) && nodes.filter(n => n.type === 'place').length < 5) {
        foundEntities.add(place);
        const nodeId = `place-${nodes.length}`;
        nodes.push({
          id: nodeId,
          type: 'place',
          position: { x: 550 + (nodes.filter(n => n.type === 'place').length * 50), y: 500 },
          data: {
            id: nodeId,
            label: place,
            category: 'place',
            size: 'medium',
            entityType: 'place'
          }
        });
        
        edges.push({
          id: `edge-main-${nodeId}`,
          source: 'main-concept',
          target: nodeId,
          type: 'default',
          animated: false,
          data: {
            label: 'located in'
          }
        });
      }
    }
  });
  
  // Extract documents (common document patterns)
  const documentPatterns = [
    /\b(?:the |The )([A-Z][a-z]+(?:[ -][A-Z][a-z]+)*)(?: Treaty| Constitution| Declaration| Act| Bill| Charter| Proclamation| Agreement| Code| Law)\b/g,
    /\b(Treaty|Constitution|Declaration|Act|Bill|Charter|Proclamation|Agreement|Code|Law) of [A-Z][a-z]+(?:[ -][A-Z][a-z]+)*\b/g
  ];
  
  documentPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const doc = match[0]; // The full match is the document name
      if (!foundEntities.has(doc) && nodes.filter(n => n.type === 'document').length < 3) {
        foundEntities.add(doc);
        const nodeId = `document-${nodes.length}`;
        nodes.push({
          id: nodeId,
          type: 'document',
          position: { x: 300 + (nodes.filter(n => n.type === 'document').length * 50), y: 550 },
          data: {
            id: nodeId,
            label: doc,
            category: 'document',
            size: 'medium',
            entityType: 'document'
          }
        });
        
        edges.push({
          id: `edge-main-${nodeId}`,
          source: 'main-concept',
          target: nodeId,
          type: 'dashed',
          animated: false,
          data: {
            label: 'references'
          }
        });
      }
    }
  });
  
  // Extract concepts (abstract ideas, often preceded by articles and not already captured)
  const conceptPatterns = [
    /\b(?:the |The )([A-Z][a-z]+(?:[ -][A-Z][a-z]+)*)(?: Movement| Era| Age| Period| Century| Revolution| Enlightenment| Renaissance)\b/g,
    /\b(democracy|socialism|capitalism|communism|liberalism|conservatism|nationalism|imperialism|colonialism|feudalism|monarchy|republic|ideology|philosophy|theory|concept|idea)\b/gi
  ];
  
  conceptPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const concept = match[1] || match[0]; // Use capturing group if available
      if (!foundEntities.has(concept) && nodes.filter(n => n.type === 'concept' && n.id !== 'main-concept').length < 5) {
        foundEntities.add(concept);
        const nodeId = `concept-${nodes.length}`;
        nodes.push({
          id: nodeId,
          type: 'concept',
          position: { x: 200 + (nodes.filter(n => n.type === 'concept' && n.id !== 'main-concept').length * 50), y: 150 },
          data: {
            id: nodeId,
            label: concept,
            category: 'concept',
            size: 'small',
            entityType: 'concept'
          }
        });
        
        edges.push({
          id: `edge-${nodeId}-main`,
          source: nodeId,
          target: 'main-concept',
          type: 'dashed',
          animated: false,
          data: {
            label: 'related to'
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
        entityType: 'concept'
      },
    });
    
    // Create date nodes for start and end dates
    if (timeline.start_date) {
      const startDateId = `date-start-${timeline.id}`;
      nodes.push({
        id: startDateId,
        type: 'date',
        position: { x: 50, y: 200 + index * 200 },
        data: {
          id: startDateId,
          label: timeline.start_date,
          category: 'date',
          size: 'small',
          entityType: 'date'
        }
      });
      
      edges.push({
        id: `edge-${startDateId}-timeline-${timeline.id}`,
        source: startDateId,
        target: `timeline-${timeline.id}`,
        type: 'timeline',
        data: {
          label: 'starts'
        }
      });
    }
    
    if (timeline.end_date) {
      const endDateId = `date-end-${timeline.id}`;
      nodes.push({
        id: endDateId,
        type: 'date',
        position: { x: 300, y: 200 + index * 200 },
        data: {
          id: endDateId,
          label: timeline.end_date,
          category: 'date',
          size: 'small',
          entityType: 'date'
        }
      });
      
      edges.push({
        id: `edge-timeline-${timeline.id}-${endDateId}`,
        source: `timeline-${timeline.id}`,
        target: endDateId,
        type: 'timeline',
        data: {
          label: 'ends'
        }
      });
    }
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
        entityType: 'event',
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
    
    // Create date node for event date if it exists
    if (formattedDate) {
      // Check if we already have this date as a node
      let dateNodeId = nodes.find((n: any) => 
        n.type === 'date' && n.data.label === formattedDate
      )?.id;
      
      // If not, create a new date node
      if (!dateNodeId) {
        dateNodeId = `date-event-${event.id}`;
        nodes.push({
          id: dateNodeId,
          type: 'date',
          position: { x: 400 + (index % 3) * 200, y: 50 + Math.floor(index / 3) * 150 },
          data: {
            id: dateNodeId,
            label: formattedDate,
            category: 'date',
            size: 'small',
            entityType: 'date'
          }
        });
      }
      
      // Connect event to date
      edges.push({
        id: `edge-${dateNodeId}-event-${event.id}`,
        source: dateNodeId,
        target: `event-${event.id}`,
        type: 'timeline',
        data: {
          label: 'on date'
        }
      });
    }
  });
  
  return { nodes, edges };
}
