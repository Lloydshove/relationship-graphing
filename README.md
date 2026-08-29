

📘 Relationship Graph — Master Markdown File

This document defines a relationship graph for Lloyd’s extended network (including friends‑of‑friends). It contains:

1. Context & update rules
2. JSON schema
3. Human‑readable relationship list
4. Machine‑readable JSON dataset generated from that list


Future agents should follow the rules below to update the dataset whenever new English‑language relationship statements are added.

---

🧭 1. Context & Update Rules

Relationship Model

• Single event per relationship
• Directed only when explicitly directional
• Real names
• Minimal detail
• Wider network
• Context fields: workplace, event, activity
• Mediator field
• Flat language type


Directionality Rules

• If explicitly directional → "directional": true
• If not directional → field omitted
• Non‑directional relationships stored as a single directed edge (A → B)


Update Procedure

When new human text is added:

1. Parse sentence
2. Add people if missing
3. Add relationship types if missing
4. Add relationship entry
5. Do not modify existing IDs


---

📝 2. Human‑Readable Relationship List

These are all current relationships, including the six new ones:

• Lloyd met Kenny at university
• Jacky met Loretta at university
• Lloyd met Nick at work (Evolution)
• Martin met Vicky at work (BGI)
• Vicky met Flora at school
• Flora met Rose at school
• Nick met Flora through Harry
• Nick met Harry via Sailing
• Therasa met Sarah at Spanish
• Lloyd met Jacky at Kenny and Loretta wedding
• Dave met Dan at work
• Flora met Dan through Sailing
• Lloyd met Marisa studying Mandarin
• Fran met Dave at work
• Fran met Dan at work
• Flora met Harry through Sailing
• Justin met Rose at accountancy college
• Graeme met Lloyd at work (Evolution)
• Graeme met Angela at university


---

🧩 3. JSON Schema

{
  "people": [
    {
      "id": "string",
      "name": "string",
      "notes": "string (optional)"
    }
  ],
  "relationshipTypes": [
    {
      "id": "string",
      "label": "string",
      "description": "string",
      "subcontext": {
        "workplace": "string (optional)",
        "event": "string (optional)",
        "activity": "string (optional)",
        "language": "string (optional)"
      }
    }
  ],
  "relationships": [
    {
      "id": "string",
      "from": "person.id",
      "to": "person.id",
      "type": "relationshipType.id",
      "mediator": "string (optional)",
      "context": {
        "workplace": "string (optional)",
        "event": "string (optional)",
        "activity": "string (optional)"
      },
      "description": "string"
    }
  ]
}


---

🧱 4. Machine‑Readable JSON Dataset

Below is the updated dataset with all new relationships added.

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
    { "id": "p19", "name": "Angela" }
  ],
  "relationshipTypes": [
    { "id": "rt1", "label": "met_at_university", "description": "Two people met at university.", "subcontext": {} },
    { "id": "rt2", "label": "met_at_work", "description": "Two people met at work.", "subcontext": { "workplace": "" } },
    { "id": "rt3", "label": "met_at_school", "description": "Two people met at school.", "subcontext": {} },
    { "id": "rt4", "label": "met_through_person", "description": "One person met another through a mediator.", "subcontext": {} },
    { "id": "rt5", "label": "met_via_activity", "description": "Two people met via an activity.", "subcontext": { "activity": "" } },
    { "id": "rt6", "label": "met_at_event", "description": "Two people met at a named event.", "subcontext": { "event": "" } },
    { "id": "rt7", "label": "met_at_spanish_class", "description": "Two people met at Spanish class.", "subcontext": {} },
    { "id": "rt8", "label": "met_studying_language", "description": "Two people met while studying a language.", "subcontext": { "language": "" } },
    { "id": "rt9", "label": "met_at_college", "description": "Two people met at college.", "subcontext": {} }
  ],
  "relationships": [
    { "id": "r1", "from": "p1", "to": "p2", "type": "rt1", "description": "Lloyd met Kenny at university." },
    { "id": "r2", "from": "p3", "to": "p4", "type": "rt1", "description": "Jacky met Loretta at university." },
    { "id": "r3", "from": "p1", "to": "p5", "type": "rt2", "context": { "workplace": "Evolution" }, "description": "Lloyd met Nick at work (Evolution)." },
    { "id": "r4", "from": "p6", "to": "p7", "type": "rt2", "context": { "workplace": "BGI" }, "description": "Martin met Vicky at work (BGI)." },
    { "id": "r5", "from": "p7", "to": "p8", "type": "rt3", "description": "Vicky met Flora at school." },
    { "id": "r6", "from": "p8", "to": "p9", "type": "rt3", "description": "Flora met Rose at school." },
    { "id": "r7", "from": "p5", "to": "p8", "type": "rt4", "mediator": "Harry", "description": "Nick met Flora through Harry." },
    { "id": "r8", "from": "p5", "to": "p10", "type": "rt5", "mediator": "Sailing", "description": "Nick met Harry via Sailing." },
    { "id": "r9", "from": "p11", "to": "p12", "type": "rt7", "description": "Therasa met Sarah at Spanish." },
    { "id": "r10", "from": "p1", "to": "p3", "type": "rt6", "context": { "event": "Kenny and Loretta wedding" }, "description": "Lloyd met Jacky at Kenny and Loretta wedding." },
    { "id": "r11", "from": "p13", "to": "p14", "type": "rt2", "context": { "workplace": "unknown" }, "description": "Dave met Dan at work." },
    { "id": "r12", "from": "p8", "to": "p14", "type": "rt4", "mediator": "Sailing", "description": "Flora met Dan through Sailing." },
    { "id": "r13", "from": "p1", "to": "p15", "type": "rt8", "description": "Lloyd met Marisa studying Mandarin." },

    { "id": "r14", "from": "p16", "to": "p13", "type": "rt2", "context": { "workplace": "unknown" }, "description": "Fran met Dave at work." },
    { "id": "r15", "from": "p16", "to": "p14", "type": "rt2", "context": { "workplace": "unknown" }, "description": "Fran met Dan at work." },
    { "id": "r16", "from": "p8", "to": "p10", "type": "rt5", "mediator": "Sailing", "description": "Flora met Harry through Sailing." },
    { "id": "r17", "from": "p17", "to": "p9", "type": "rt9", "description": "Justin met Rose at accountancy college." },
    { "id": "r18", "from": "p18", "to": "p1", "type": "rt2", "context": { "workplace": "Evolution" }, "description": "Graeme met Lloyd at work (Evolution)." },
    { "id": "r19", "from": "p18", "to": "p19", "type": "rt1", "description": "Graeme met Angela at university." }
  ]
}

