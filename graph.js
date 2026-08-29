async function loadGraph() {
  const data = await fetch('./data/relationships.json').then(r => r.json());

  const nodes = data.people.map(p => ({
    data: { id: p.id, label: p.name }
  }));

  const edges = data.relationships.map(r => {
    const typeObj = data.relationshipTypes.find(t => t.id === r.type);
    let label = typeObj.label;

    if (r.type === 'rt4' && r.mediator) label = `Met via ${r.mediator}`;
    if (r.type === 'rt5' && r.mediator) label = `Met via ${r.mediator}`;
    if (r.type === 'rt6' && r.context?.event) label = `Met at ${r.context.event}`;
    if (r.type === 'rt10' && r.context?.city) label = `Met in ${r.context.city}`;

    return {
      data: {
        id: r.id,
        source: r.from,
        target: r.to,
        label,
        mediator: r.mediator || null,
        context: r.context || null,
        description: r.description,
        type: r.type
      }
    };
  });

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
          'font-size': '18px',
          'width': '80px',
          'height': '80px'
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
      }
    ],
    layout: { name: 'cose', animate: true }
  });

  // Center graph on clicked person
  cy.on('tap', 'node', evt => {
    const node = evt.target;

    cy.animate({
      center: { eles: node },
      duration: 500
    });
  });

  // Drawer toggle
  const drawer = document.getElementById('drawer');
  const drawerToggle = document.getElementById('drawerToggle');

  drawerToggle.addEventListener('click', () => {
    drawer.classList.toggle('open');
  });

  // Filters
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.type;
      cy.edges().forEach(e => {
        e.style('opacity', e.data('type') === type ? 1 : 0.2);
      });
    });
  });

  document.querySelectorAll('.filter-context').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.context;
      const val = btn.dataset.value;

      cy.edges().forEach(e => {
        const ctx = e.data('context') || {};
        e.style('opacity', ctx[key] === val ? 1 : 0.2);
      });
    });
  });

  document.getElementById('clearFilters').addEventListener('click', () => {
    cy.edges().forEach(e => e.style('opacity', 1));
  });

  // Clustering (Louvain)
  document.getElementById('runClustering').addEventListener('click', () => {
    const louvain = cy.elements().louvain();
    const colors = ['#ffcccc', '#ccffcc', '#ccccff', '#fff0b3', '#e0ccff', '#ccf2ff'];

    cy.nodes().forEach(n => {
      const cid = louvain[n.id()];
      n.style('background-color', colors[cid % colors.length]);
    });
  });

  document.getElementById('clearClustering').addEventListener('click', () => {
    cy.nodes().forEach(n => n.style('background-color', '#4a90e2'));
  });

  // Theme toggle
  document.getElementById('themeToggle').addEventListener('click', () => {
    document.body.classList.toggle('dark');
    document.body.classList.toggle('light');
  });
}

loadGraph();
