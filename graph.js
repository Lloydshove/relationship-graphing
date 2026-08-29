async function loadGraph() {
  const data = await fetch('./data/relationships.json').then(r => r.json());

  const nodes = data.people.map(p => ({
    data: { id: p.id, label: p.name }
  }));

  const edges = data.relationships.map(r => ({
    data: {
      id: r.id,
      source: r.from,
      target: r.to,
      label: r.description,   // ← USE DESCRIPTION INSTEAD OF TYPE/ID
      mediator: r.mediator || null,
      context: r.context || null,
      type: r.type
    }
  }));

  const cy = cytoscape({
    container: document.getElementById('cy'),
    elements: [...nodes, ...edges],
    style: [
      {
        selector: 'node',
        style: {
          'label': 'data(label)',
          'background-color': '#4a90e2',
          'color': '#fff',
          'text-valign': 'center',
          'text-halign': 'center',
          'font-size': '16px',
          'width': '60px',
          'height': '60px'
        }
      },
      {
        selector: 'edge',
        style: {
          'label': 'data(label)',
          'font-size': '12px',
          'line-color': '#999',
          'target-arrow-color': '#999',
          'target-arrow-shape': 'triangle',
          'curve-style': 'bezier',
          'text-background-color': '#ffffff',
          'text-background-opacity': 0.8,
          'text-background-padding': '3px'
        }
      },
      {
        selector: 'edge[mediator]',
        style: {
          'line-color': '#8e44ad',
          'target-arrow-color': '#8e44ad'
        }
      },
      {
        selector: 'edge[context]',
        style: {
          'line-color': '#27ae60',
          'target-arrow-color': '#27ae60'
        }
      }
    ],
    layout: { name: 'cose', animate: true }
  });

  cy.on('tap', 'edge', evt => {
    const d = evt.target.data();
    alert(
      `Relationship: ${d.label}\n\n` +
      (d.mediator ? `Mediator: ${d.mediator}\n` : '') +
      (d.context ? `Context: ${JSON.stringify(d.context)}\n` : '')
    );
  });

  // DARK MODE TOGGLE
  const toggle = document.getElementById('themeToggle');
  toggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    document.body.classList.toggle('light');

    const dark = document.body.classList.contains('dark');

    cy.style()
      .selector('node')
      .style({
        'background-color': dark ? '#1e90ff' : '#4a90e2',
        'color': dark ? '#fff' : '#fff'
      })
      .update();

    cy.style()
      .selector('edge')
      .style({
        'line-color': dark ? '#bbb' : '#999',
        'target-arrow-color': dark ? '#bbb' : '#999',
        'text-background-color': dark ? '#333' : '#fff'
      })
      .update();
  });
}

loadGraph();
