

📎 Relationship Graph Schema

This document defines the data schema for the Relationship Graph project.
It specifies the structure of people, relationship types, and relationships, including optional fields for context and year.

---

People

{
  "id": "string",          // unique person ID (e.g., "p1")
  "name": "string"         // person's name
}


---

Relationship Types

{
  "id": "string",          // unique type ID (e.g., "rt5")
  "label": "string"        // human-readable label (e.g., "Met via activity")
}


---

Relationships

{
  "id": "string",          // unique relationship ID (e.g., "r12")

  "from": "string",        // person ID of origin
  "to": "string",          // person ID of target
  "type": "string",        // relationship type ID

  "mediator": "string|null",   // optional: person or activity name
                               // e.g., "Harry", "Sailing"

  "context": {                 // optional contextual metadata
    "workplace": "string",     // e.g., "Evolution"
    "event": "string",         // e.g., "Kenny and Loretta wedding"
    "activity": "string",      // e.g., "Sailing"
    "city": "string"           // e.g., "London"
  },

  "year": "number|null",       // optional year the relationship occurred
                               // must be a 4-digit integer (e.g., 2018)

  "description": "string"      // human-readable summary of the relationship
                               // e.g., "Flora met Philippa via Sailing."
}


---

Notes

• IDs are stable and unique:• pX for people
• rtX for relationship types
• rX for relationships

• Year field is optional. Use null if unknown.
• Context fields are optional. Include only when relevant.
• Mediator is optional. Used when a third party or activity facilitated the meeting.
• Description must always be present for clarity.


---

Example

{
  "id": "r12",
  "from": "p8",
  "to": "p14",
  "type": "rt5",
  "mediator": "Sailing",
  "year": 2018,
  "description": "Flora met Dan via Sailing."
}


---

This schema is the authoritative reference for all data in data/relationships.json.
See the README.md for project context and linked files.
