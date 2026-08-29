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
      label: r.type,
      mediator: r.mediator || null,
      context: r.context || null,
      description: r.description
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
          'font-size': '12px'
        }
      },
      {
        selector: 'edge',
        style: {
          'label': 'data(label)',
          'font-size': '10px',
          'line-color': '#999',
          'target-arrow-color': '#999',
          'target-arrow-shape': 'triangle',
          'curve-style': 'bezier'
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
      `Description: ${d.description}\n` +
      (d.mediator ? `Mediator: ${d.mediator}\n` : '') +
      (d.context ? `Context: ${JSON.stringify(d.context)}\n` : '')
    );
  });
}

loadGraph();
