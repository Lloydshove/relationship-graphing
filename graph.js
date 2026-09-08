async function loadGraph() {
  const data = await fetch('./data/relationships.json').then(r => r.json());

  function edgeClassForType(type) {
    if (type === 'rt11') return 'edge-couple';
    if (type === 'rt12') return 'edge-married';
    if (type === 'rt13') return 'edge-parent';
    return 'edge-meeting';
  }

  function buildFamilyGroups(relationships) {
    const childToParents = new Map();

    relationships
      .filter(r => r.type === 'rt13')
      .forEach(r => {
        if (!childToParents.has(r.to)) childToParents.set(r.to, new Set());
        childToParents.get(r.to).add(r.from);
      });

    const grouped = new Map();

    childToParents.forEach((parentsSet, childId) => {
      const parents = Array.from(parentsSet).sort();
      const key = parents.join('|');

      if (!grouped.has(key)) {
        grouped.set(key, { parents: new Set(parents), children: new Set() });
      }

      grouped.get(key).children.add(childId);
    });

    return Array.from(grouped.entries()).map(([key, members], i) => ({
      id: `family_group_${i + 1}`,
      key,
      members: [...members.parents, ...members.children]
    }));
  }

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
      },
      classes: edgeClassForType(r.type)
    };
  });

  const familyGroups = buildFamilyGroups(data.relationships);

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
          'target-arrow-shape': 'none',
          'curve-style': 'bezier',
          'control-point-step-size': 40,
          'text-background-color': '#ffffff',
          'text-background-opacity': 0.8,
          'text-background-padding': '3px',
          'transition-property': 'opacity',
          'transition-duration': '0.3s'
        }
      },
      {
        selector: 'edge.edge-meeting',
        style: {
          'line-color': '#7f8c8d',
          'target-arrow-color': '#7f8c8d',
          'width': 2
        }
      },
      {
        selector: 'edge.edge-couple',
        style: {
          'line-color': '#f59e0b',
          'target-arrow-color': '#f59e0b',
          'line-style': 'dashed',
          'width': 3,
          'curve-style': 'unbundled-bezier',
          'control-point-distances': -28,
          'control-point-weights': 0.5
        }
      },
      {
        selector: 'edge.edge-married',
        style: {
          'line-color': '#c2410c',
          'target-arrow-color': '#c2410c',
          'width': 4,
          'line-outline-width': 2,
          'line-outline-color': '#fdba74',
          'curve-style': 'unbundled-bezier',
          'control-point-distances': 28,
          'control-point-weights': 0.5
        }
      },
      {
        selector: 'edge.edge-parent',
        style: {
          'line-color': '#16a34a',
          'target-arrow-color': '#16a34a',
          'target-arrow-shape': 'triangle',
          'width': 3
        }
      },
      {
        selector: 'node.family-group',
        style: {
          'background-color': '#ec4899',
          'background-opacity': 0.1,
          'border-width': 2,
          'border-style': 'dashed',
          'border-color': '#db2777',
          'shape': 'round-rectangle',
          'padding': '22px',
          'label': 'Family',
          'text-valign': 'top',
          'text-halign': 'center',
          'font-size': '11px',
          'color': '#9d174d',
          'z-compound-depth': 'bottom',
          'events': 'no',
          'display': 'none'
        }
      }
    ],
    layout: { name: 'cose', animate: true }
  });

  cy.add(familyGroups.map(group => ({
    data: { id: group.id },
    classes: 'family-group'
  })));

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
  const familyGroupingToggle = document.getElementById('familyGroupingToggle');

  drawerToggle.addEventListener('click', () => {
    drawer.classList.toggle('open');
  });

  function closeDrawer() {
    drawer.classList.remove('open');
  }

  function setFamilyGrouping(enabled) {
    familyGroups.forEach(group => {
      const groupNode = cy.getElementById(group.id);

      groupNode.style('display', enabled ? 'element' : 'none');
      group.members.forEach(memberId => {
        const memberNode = cy.getElementById(memberId);
        if (memberNode.nonempty()) {
          memberNode.move({ parent: enabled ? group.id : null });
        }
      });
    });

    cy.layout({ name: 'cose', animate: true }).run();
  }

  if (familyGroupingToggle) {
    familyGroupingToggle.addEventListener('change', () => {
      setFamilyGrouping(familyGroupingToggle.checked);
      closeDrawer();
    });
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
