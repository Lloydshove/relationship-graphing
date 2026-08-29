async function loadGraph() {
  const data = await fetch('./data/relationships.json').then(r => r.json());

  const nodes = data.people.map(p => ({
    data: { id: p.id, label: p.name }
  }));

  const edges = data.relationships.map(r => {
    const typeObj = data.relationshipTypes.find(t => t.id === r.type);
    let label = typeObj.label;

    if (r.type === 'rt4' && r.mediator) {
      label = `Met via ${r.mediator}`;
    }

    if (r.type === 'rt5' && r.mediator) {
      label = `Met via ${r.mediator}`;
    }

    if (r.type === 'rt6' && r.context && r.context.event) {
      label = `Met at ${r.context.event}`;
    }

    if (r.type === 'rt10' && r.context && r.context.city) {
      label = `Met in ${r.context.city}`;
    }

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
          'text-background-padding': '3px',
          'opacity': 1
        }
      },
      {
        selector: 'edge[type = "rt2"]',
        style: {
          'line-color': '#27ae60',
          'target-arrow-color': '#27ae60'
        }
      },
      {
        selector: 'edge[type = "rt1"]',
        style: {
          'line-color': '#2980b9',
          'target-arrow-color': '#2980b9'
        }
      },
      {
        selector: 'edge[type = "rt3"]',
        style: {
          'line-color': '#8e44ad',
          'target-arrow-color': '#8e44ad'
        }
      },
      {
        selector: 'edge[type = "rt4"]',
        style: {
          'line-color': '#9b59b6',
          'target-arrow-color': '#9b59b6'
        }
      },
      {
        selector: 'edge[type = "rt5"]',
        style: {
          'line-color': '#16a085',
          'target-arrow-color': '#16a085'
        }
      },
      {
        selector: 'edge[type = "rt6"]',
        style: {
          'line-color': '#f1c40f',
          'target-arrow-color': '#f1c40f'
        }
      },
      {
        selector: 'edge[type = "rt7"]',
        style: {
          'line-color': '#e67e22',
          'target-arrow-color': '#e67e22'
        }
      },
      {
        selector: 'edge[type = "rt8"]',
        style: {
          'line-color': '#d35400',
          'target-arrow-color': '#d35400'
        }
      },
      {
        selector: 'edge[type = "rt9"]',
        style: {
          'line-color': '#34495e',
          'target-arrow-color': '#34495e'
        }
      },
      {
        selector: 'edge[type = "rt10"]',
        style: {
          'line-color': '#3498db',
          'target-arrow-color': '#3498db'
        }
      },
      {
        selector: '.faded',
        style: {
          'opacity': 0.2
        }
      },
      {
        selector: '.highlighted',
        style: {
          'border-width': 4,
          'border-color': '#ffcc00'
        }
      }
    ],
    layout: { name: 'cose', animate: true }
  });

  // Edge tooltip
  cy.on('tap', 'edge', evt => {
    const d = evt.target.data();
    alert(
      `Relationship: ${d.description}\n\n` +
      (d.mediator ? `Mediator: ${d.mediator}\n` : '') +
      (d.context ? `Context: ${JSON.stringify(d.context)}\n` : '')
    );
  });

  // Center graph on clicked person
  cy.on('tap', 'node', evt => {
    const node = evt.target;

    cy.nodes().removeClass('highlighted');
    node.addClass('highlighted');

    cy.animate({
      center: { eles: node },
      duration: 500
    });

    cy.edges().removeClass('faded');
    cy.edges().forEach(e => {
      const src = e.data('source');
      const tgt = e.data('target');
      if (src !== node.id() && tgt !== node.id()) {
        e.addClass('faded');
      }
    });
  });

  // Reset fade when tapping background
  cy.on('tap', evt => {
    if (evt.target === cy) {
      cy.edges().removeClass('faded');
      cy.nodes().removeClass('highlighted');
    }
  });

  // Theme toggle
  const toggle = document.getElementById('themeToggle');
  toggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    document.body.classList.toggle('light');

    const dark = document.body.classList.contains('dark');

    cy.style()
      .selector('node')
      .style({
        'background-color': dark ? '#1e90ff' : '#4a90e2',
        'color': '#fff'
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

  // Filter by relationship type
  const typeButtons = document.querySelectorAll('.filter-btn');
  typeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.getAttribute('data-type');
      cy.edges().removeClass('faded');
      cy.edges().forEach(e => {
        if (e.data('type') !== type) {
          e.addClass('faded');
        }
      });
    });
  });

  // Filter by context
  const contextButtons = document.querySelectorAll('.filter-context');
  contextButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const ctxKey = btn.getAttribute('data-context');
      const ctxVal = btn.getAttribute('data-value');

      cy.edges().removeClass('faded');
      cy.edges().forEach(e => {
        const ctx = e.data('context') || {};
        if (!ctx[ctxKey] || ctx[ctxKey] !== ctxVal) {
          e.addClass('faded');
        }
      });
    });
  });

  // Clear filters
  document.getElementById('clearFilters').addEventListener('click', () => {
    cy.edges().removeClass('faded');
  });

  // Clustering (Louvain community detection)
  const runClusteringBtn = document.getElementById('runClustering');
  const clearClusteringBtn = document.getElementById('clearClustering');

  runClusteringBtn.addEventListener('click', () => {
    const louvain = cy.elements().louvain();
    const clusters = {};

    cy.nodes().forEach(n => {
      const cid = louvain[n.id()];
      n.data('cluster', cid);
      if (!clusters[cid]) clusters[cid] = [];
      clusters[cid].push(n);
    });

    const colors = ['#ffcccc', '#ccffcc', '#ccccff', '#fff0b3', '#e0ccff', '#ccf2ff'];

    Object.keys(clusters).forEach((cid, idx) => {
      const color = colors[idx % colors.length];
      clusters[cid].forEach(n => {
        n.style('background-color', color);
      });
    });
  });

  clearClusteringBtn.addEventListener('click', () => {
    cy.nodes().forEach(n => {
      n.removeData('cluster');
      n.style('background-color', '#4a90e2');
    });
  });
}

loadGraph();
