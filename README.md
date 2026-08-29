

📘 Relationship Graph — Master Specification

(Updated with new connections & removal of Nick–Harry Sailing)

This document defines Lloyd’s extended relationship graph.
It contains:

1. Context & rules
2. Relationship types
3. Human‑readable relationship list
4. Machine‑readable JSON dataset


---

🧭 1. Context & Update Rules

Relationship Model

• Single event per relationship
• Directed only when explicitly directional
• Real names
• Minimal detail
• Context fields: workplace, event, activity, city
• Mediator field
• Human‑readable relationship type labels
• If met via person → Met via 
• If met via activity → Met via 
• If met at event → Met at 
• If met in city → Met in 


Directionality

• If explicitly directional → "directional": true
• Otherwise → omit


Update Procedure

1. Parse sentence
2. Add people if missing
3. Add relationship type if missing
4. Add relationship
5. Do not modify existing IDs


---

📝 2. Human‑Readable Relationship List

(Updated)

Core relationships

• Lloyd met Kenny at university
• Lloyd met Nick at work (Evolution)
• Martin met Vicky at work (BGI)
• Vicky met Flora at school
• Flora met Rose at school
• Nick met Flora via Harry
• Nick and Harry did not meet via Sailing — removed
• Therasa met Sarah at Spanish
• Lloyd met Jacky at Kenny and Loretta wedding
• Dave met Dan at work
• Flora met Dan via Sailing
• Lloyd met Marisa studying Mandarin
• Fran met Dave at work
• Fran met Dan at work
• Flora met Harry via Sailing
• Justin met Rose at accountancy college
• Graeme met Lloyd at work (Evolution)
• Graeme met Angela at university
• Graeme met Nick at work (Evolution)
• Jacky met CatChing in London
• Jacky met Loretta via CatChing


Newly added relationships

• Matt met Nick at university
• Matt met Harry at university
• Philippa met Nick via Sailing
• Sarah met Pam via learning Spanish
• Philippa met Sarah via learning Spanish
• Flora met Philippa via Sailing ← NEW


---

🧩 3. Relationship Types (Human‑Readable)

ID	Label	
rt1	Met at university	
rt2	Met at work	
rt3	Met at school	
rt4	Met via person	
rt5	Met via activity	
rt6	Met at event	
rt7	Met at Spanish class	
rt8	Met studying language	
rt9	Met at college	
rt10	Met in city	


---

🧱 4. JSON Dataset (Fully Updated)

🔧 Changes applied:

• Removed r8 (Nick ↔ Harry via Sailing)
• Added r28 (Flora ↔ Philippa via Sailing)


All other IDs preserved.

{
  "people": [
    { "id": "p1", "name": "Lloyd" },
    { "id": "p2", "name": "Kenny" },
    { "id": "p3", "name": "Jacky" },
    { "id": "p4", "name": "Loretta" },
    { "id": "p5", "name": "Nick" },
    { "id": "p6", "name": "Martin" },
    { "id": "p7", "name": "Vicky" },
    { "id": "p8", "name": "Flora" },
    { "id": "p9", "name": "Rose" },
    { "id": "p10", "name": "Harry" },
    { "id": "p11", "name": "Therasa" },
    { "id": "p12", "name": "Sarah" },
    { "id": "p13", "name": "Dave" },
    { "id": "p14", "name": "Dan" },
    { "id": "p15", "name": "Marisa" },
    { "id": "p16", "name": "Fran" },
    { "id": "p17", "name": "Justin" },
    { "id": "p18", "name": "Graeme" },
    { "id": "p19", "name": "Angela" },
    { "id": "p20", "name": "CatChing" },
    { "id": "p21", "name": "Matt" },
    { "id": "p22", "name": "Philippa" },
    { "id": "p23", "name": "Pam" }
  ],

  "relationshipTypes": [
    { "id": "rt1", "label": "Met at university" },
    { "id": "rt2", "label": "Met at work" },
    { "id": "rt3", "label": "Met at school" },
    { "id": "rt4", "label": "Met via person" },
    { "id": "rt5", "label": "Met via activity" },
    { "id": "rt6", "label": "Met at event" },
    { "id": "rt7", "label": "Met at Spanish class" },
    { "id": "rt8", "label": "Met studying language" },
    { "id": "rt9", "label": "Met at college" },
    { "id": "rt10", "label": "Met in city" }
  ],

  "relationships": [
    { "id": "r1", "from": "p1", "to": "p2", "type": "rt1", "description": "Lloyd met Kenny at university." },

    { "id": "r3", "from": "p1", "to": "p5", "type": "rt2", "context": { "workplace": "Evolution" }, "description": "Lloyd met Nick at work (Evolution)." },
    { "id": "r4", "from": "p6", "to": "p7", "type": "rt2", "context": { "workplace": "BGI" }, "description": "Martin met Vicky at work (BGI)." },

    { "id": "r5", "from": "p7", "to": "p8", "type": "rt3", "description": "Vicky met Flora at school." },
    { "id": "r6", "from": "p8", "to": "p9", "type": "rt3", "description": "Flora met Rose at school." },

    { "id": "r7", "from": "p5", "to": "p8", "type": "rt4", "mediator": "Harry", "description": "Nick met Flora via Harry." },

    { "id": "r9", "from": "p11", "to": "p12", "type": "rt7", "description": "Therasa met Sarah at Spanish." },

    {
      "id": "r10",
      "from": "p1",
      "to": "p3",
      "type": "rt6",
      "context": { "event": "Kenny and Loretta wedding" },
      "description": "Lloyd met Jacky at Kenny and Loretta wedding."
    },

    { "id": "r11", "from": "p13", "to": "p14", "type": "rt2", "context": { "workplace": "unknown" }, "description": "Dave met Dan at work." },
    { "id": "r12", "from": "p8", "to": "p14", "type": "rt4", "mediator": "Sailing", "description": "Flora met Dan via Sailing." },

    { "id": "r13", "from": "p1", "to": "p15", "type": "rt8", "description": "Lloyd met Marisa studying Mandarin." },

    { "id": "r14", "from": "p16", "to": "p13", "type": "rt2", "context": { "workplace": "unknown" }, "description": "Fran met Dave at work." },
    { "id": "r15", "from": "p16", "to": "p14", "type": "rt2", "context": { "workplace": "unknown" }, "description": "Fran met Dan at work." },

    { "id": "r16", "from": "p8", "to": "p10", "type": "rt5", "mediator": "Sailing", "description": "Flora met Harry via Sailing." },

    { "id": "r17", "from": "p17", "to": "p9", "type": "rt9", "description": "Justin met Rose at accountancy college." },

    { "id": "r18", "from": "p18", "to": "p1", "type": "rt2", "context": { "workplace": "Evolution" }, "description": "Graeme met Lloyd at work (Evolution)." },
    { "id": "r19", "from": "p18", "to": "p19", "type": "rt1", "description": "Graeme met Angela at university." },
    { "id": "r20", "from": "p18", "to": "p5", "type": "rt2", "context": { "workplace": "Evolution" }, "description": "Graeme met Nick at work (Evolution)." },

    {
      "id": "r21",
      "from": "p3",
      "to": "p20",
      "type": "rt10",
      "context": { "city": "London" },
      "description": "Jacky met CatChing in London."
    },

    {
      "id": "r22",
      "from": "p3",
      "to": "p4",
      "type": "rt4",
      "mediator": "CatChing",
      "description": "Jacky met Loretta via CatChing."
    },

    { "id": "r23", "from": "p21", "to": "p5", "type": "rt1", "description": "Matt met Nick at university." },
    { "id": "r24", "from": "p21", "to": "p10", "type": "rt1", "description": "Matt met Harry at university." },

    { "id": "r25", "from": "p22", "to": "p5", "type": "rt5", "mediator": "Sailing", "description": "Philippa met Nick via Sailing." },

    { "id": "r26", "from": "p12", "to": "p23", "type": "rt8", "description": "Sarah met Pam via learning Spanish." },

    { "id": "r27", "from": "p22", "to": "p12", "type": "rt8", "description": "Philippa met Sarah via learning Spanish." },

    { "id": "r28", "from": "p8", "to": "p22", "type": "rt5", "mediator": "Sailing", "description": "Flora met Philippa via Sailing." }
  ]
}


