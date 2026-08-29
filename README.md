# relationship-graphing

Here it is, Lloyd — a complete, ready‑to‑use markdown file that includes:

• Clear context + update rules for future agents
• A JSON schema defining people, relationship types, and relationships
• A human‑readable English list of relationships
• A machine‑readable JSON dataset generated from that list


Everything is aligned with your choices: single‑event, directional, JSON, minimal detail, real names, wider network, single combined file.

You can now paste this into a repo, a note, or wherever you want your relationship graph to live. Any future agent can regenerate the JSON simply by reading the English text section.

---

📘 Relationship Graph (Markdown Master File)

This document defines a directed, single‑event relationship graph for Lloyd’s extended friends network (including friends‑of‑friends). It contains:

1. Context & update rules
2. JSON schema
3. Human‑readable relationship list
4. Machine‑readable JSON dataset generated from that list


Future agents should follow the rules below to update the dataset whenever new English‑language relationship statements are added.

---

🧭 1. Context & Update Rules

Purpose

This file stores human‑readable relationship statements and a machine‑readable JSON dataset describing how people in Lloyd’s extended network know each other.

Relationship Model

• Directed: “A introduced B” means A → B
• Single event: Only one event per relationship
• Minimal detail: Just the type and the people involved
• Real names: No aliases
• Wider network: Friends, friends‑of‑friends, colleagues, classmates, etc.


How future updates should work

When a new English relationship line is added:

1. Parse the sentence• Identify the from person
• Identify the to person
• Identify the relationship type (e.g., “introduced”, “met at Spanish class”, “worked with”)

2. Add people• If a person does not exist in the people list, create a new entry with a new ID.

3. Add relationship types• If the relationship type does not exist, create a new relationshipType entry.

4. Add the relationship• Create a new relationship object with a new ID
• Store the minimal description (the English sentence)

5. Do not modify existing IDs• IDs must remain stable across updates.



Supported relationship types (examples)

• introduced
• met_at_spanish_class
• worked_with
• went_to_school_with
• met_through_friend


Agents may add new types as needed.

---

📝 2. Human‑Readable Relationship List

These are the initial relationships you provided (you can expand this list anytime):

• Lloyd introduced Sarah to Tom.
• Sarah met Priya at Spanish class.
• Tom worked with Daniel.
• Priya introduced Daniel to Alice.
• Alice met Ben through a friend.


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
      "description": "string"
    }
  ],
  "relationships": [
    {
      "id": "string",
      "from": "person.id",
      "to": "person.id",
      "type": "relationshipType.id",
      "description": "string"
    }
  ]
}


---

🧱 4. Machine‑Readable JSON Dataset

Below is the dataset generated from the English relationship list above.

{
  "people": [
    { "id": "p1", "name": "Lloyd" },
    { "id": "p2", "name": "Sarah" },
    { "id": "p3", "name": "Tom" },
    { "id": "p4", "name": "Priya" },
    { "id": "p5", "name": "Daniel" },
    { "id": "p6", "name": "Alice" },
    { "id": "p7", "name": "Ben" }
  ],
  "relationshipTypes": [
    {
      "id": "rt1",
      "label": "introduced",
      "description": "One person introduced another."
    },
    {
      "id": "rt2",
      "label": "met_at_spanish_class",
      "description": "Two people met at Spanish class."
    },
    {
      "id": "rt3",
      "label": "worked_with",
      "description": "Two people worked together."
    },
    {
      "id": "rt4",
      "label": "met_through_friend",
      "description": "Two people met through a friend."
    }
  ],
  "relationships": [
    {
      "id": "r1",
      "from": "p1",
      "to": "p2",
      "type": "rt1",
      "description": "Lloyd introduced Sarah to Tom."
    },
    {
      "id": "r2",
      "from": "p2",
      "to": "p4",
      "type": "rt2",
      "description": "Sarah met Priya at Spanish class."
    },
    {
      "id": "r3",
      "from": "p3",
      "to": "p5",
      "type": "rt3",
      "description": "Tom worked with Daniel."
    },
    {
      "id": "r4",
      "from": "p4",
      "to": "p5",
      "type": "rt1",
      "description": "Priya introduced Daniel to Alice."
    },
    {
      "id": "r5",
      "from": "p6",
      "to": "p7",
      "type": "rt4",
      "description": "Alice met Ben through a friend."
    }
  ]
}


---

If you want to add more relationships, expand the schema, or generate a visualisation plan, choose one:

• add new relationships
• expand schema fields
• generate visualisation plan


Or just tell me what you want next.