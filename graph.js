async function loadGraph() {
  const data = await fetch('./data/relationships.json').then(r => r.json());

  const nodes = data.people.map(p => ({
    data: { id: p.id, label: p.name }
  }));

  const edges = data.relationships.map(r => {
    const typeObj = data.relationshipTypes.find(t => t.id === r.type);
    let label = typeObj ? typeObj.label : '';

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
        year: r.year,
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
          'height': '80px',
          'transition-property': 'opacity',
          'transition-duration': '0.3s'
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
          'transition-property': 'opacity',
          'transition-duration': '0.3s'
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

  function closeDrawer() {
    drawer.classList.remove('open');
  }

  // Hard filtering by type
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.type;

      cy.edges().forEach(e => {
        e.style('display', e.data('type') === type ? 'element' : 'none');
      });

      closeDrawer();
    });
  });

  // Hard filtering by context
  document.querySelectorAll('.filter-context').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.context;
      const val = btn.dataset.value;

      cy.edges().forEach(e => {
        const ctx = e.data('context') || {};
        e.style('display', ctx[key] === val ? 'element' : 'none');
      });

      closeDrawer();
    });
  });

  document.getElementById('clearFilters').addEventListener('click', () => {
    cy.edges().forEach(e => e.style('display', 'element'));
    closeDrawer();
  });

  // Timeline slider
  const slider = document.getElementById('yearSlider');
  const yearLabel = document.getElementById('yearLabel');

  function applyTimeline(year) {
    yearLabel.textContent = `Showing relationships up to: ${year}`;

    cy.edges().forEach(e => {
      const y = e.data('year');

      if (y === null || y <= year) {
        e.style('display', 'element');
      } else {
        e.style('display', 'none');
      }
    });

    // Pulse nodes connected to newly visible edges
    cy.edges().forEach(e => {
      const y = e.data('year');
      if (y === year) {
        const src = cy.getElementById(e.data('source'));
        const tgt = cy.getElementById(e.data('target'));

        src.addClass('node-pulse');
        tgt.addClass('node-pulse');

        setTimeout(() => {
          src.removeClass('node-pulse');
          tgt.removeClass('node-pulse');
        }, 600);
      }
    });
  }

  slider.addEventListener('input', () => {
    const clearDecadeBtn = document.getElementById('clearDecade');
    if (clearDecadeBtn) clearDecadeBtn.click(); // auto-clear decade filter
    applyTimeline(parseInt(slider.value, 10));
    closeDrawer();
  });

  // Timeline animation
  const playBtn = document.getElementById('playTimeline');

  playBtn.addEventListener('click', async () => {
    const clearDecadeBtn = document.getElementById('clearDecade');
    if (clearDecadeBtn) clearDecadeBtn.click(); // auto-clear decade filter
    closeDrawer();

    const min = parseInt(slider.min, 10);
    const max = parseInt(slider.max, 10);

    for (let year = min; year <= max; year++) {
      slider.value = year;
      applyTimeline(year);
      await new Promise(res => setTimeout(res, 400));
    }
  });

  // Decade filtering
  function applyDecadeFilter(decadeStart) {
    const decadeEnd = decadeStart + 9;

    cy.edges().forEach(e => {
      const y = e.data('year');

      if (y !== null && y >= decadeStart && y <= decadeEnd) {
        e.style('display', 'element');
      } else {
        e.style('display', 'none');
      }
    });

    // Pulse nodes connected to visible edges
    cy.edges().forEach(e => {
      const y = e.data('year');
      if (y !== null && y >= decadeStart && y <= decadeEnd) {
        const src = cy.getElementById(e.data('source'));
        const tgt = cy.getElementById(e.data('target'));

        src.addClass('node-pulse');
        tgt.addClass('node-pulse');

        setTimeout(() => {
          src.removeClass('node-pulse');
          tgt.removeClass('node-pulse');
        }, 600);
      }
    });
  }

  document.querySelectorAll('.decade-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const decade = parseInt(btn.dataset.decade, 10);
      applyDecadeFilter(decade);
      closeDrawer();
    });
  });

  const clearDecade = document.getElementById('clearDecade');
  clearDecade.addEventListener('click', () => {
    cy.edges().forEach(e => e.style('display', 'element'));
    closeDrawer();
  });

  // Clustering
  const runClusteringBtn = document.getElementById('runClustering');
  const clearClusteringBtn = document.getElementById('clearClustering');

  runClusteringBtn.addEventListener('click', () => {
    const louvain = cy.elements().louvain();
    const colors = ['#ffcccc', '#ccffcc', '#ccccff', '#fff0b3', '#e0ccff', '#ccf2ff'];

    cy.nodes().forEach(n => {
      const cid = louvain[n.id()];
      n.style('background-color', colors[cid % colors.length]);
    });

    closeDrawer();
  });

  clearClusteringBtn.addEventListener('click', () => {
    cy.nodes().forEach(n => n.style('background-color', '#4a90e2'));
    closeDrawer();
  });

  // Theme toggle
  const themeToggle = document.getElementById('themeToggle');
  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    document.body.classList.toggle('light');
  });
}

loadGraph();
