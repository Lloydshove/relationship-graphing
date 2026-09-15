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

  function normalizeCountry(country) {
    const raw = (country || '').trim().toLowerCase();
    if (!raw) return 'UK';
    if (['uk', 'u.k.', 'u.k', 'united kingdom'].includes(raw)) return 'UK';
    if (['hong kong', 'hk', 'h.k.', 'h.k'].includes(raw)) return 'Hong Kong';
    return country;
  }

  function hashString(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = ((h << 5) - h) + str.charCodeAt(i);
      h |= 0;
    }
    return Math.abs(h);
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function getCountryAtYear(locationHistory, year) {
    const fallback = 'UK';
    if (!Array.isArray(locationHistory) || !locationHistory.length) return fallback;

    const sorted = [...locationHistory].sort((a, b) => {
      const ay = a.startYear === null ? Number.NEGATIVE_INFINITY : a.startYear;
      const by = b.startYear === null ? Number.NEGATIVE_INFINITY : b.startYear;
      return ay - by;
    });

    let active = sorted[0];

    sorted.forEach(entry => {
      const start = entry.startYear === null ? Number.NEGATIVE_INFINITY : entry.startYear;
      if (start <= year) active = entry;
    });

    return normalizeCountry(active.country || fallback);
  }

  function isRelationshipVisibleAtYear(relationship, year) {
    return relationship.year === null || relationship.year <= year;
  }

  function relationshipWeight(type) {
    if (type === 'rt12') return 1.85;
    if (type === 'rt11') return 1.65;
    if (type === 'rt13') return 1.75;
    return 1;
  }

  const COUNTRY_VISUAL = {
    'UK': {
      id: 'location_group_uk',
      label: 'U.K.',
      color: '#0ea5e9',
      border: '#0369a1',
      text: '#0c4a6e'
    },
    'Hong Kong': {
      id: 'location_group_hong_kong',
      label: 'Hong Kong',
      color: '#22d3ee',
      border: '#0e7490',
      text: '#164e63'
    }
  };

  const MOBILE_PORTRAIT_BREAKPOINT = 900;
  const MOBILE_PORTRAIT_QUERY = `(max-width: ${MOBILE_PORTRAIT_BREAKPOINT}px) and (orientation: portrait)`;

  function isMobilePortraitMode() {
    return window.matchMedia(MOBILE_PORTRAIT_QUERY).matches;
  }

  function buildCountryLayout(mode) {
    if (mode === 'mobile-portrait') {
      return {
        'UK': {
          ...COUNTRY_VISUAL.UK,
          center: { x: 0, y: -330 },
          width: 680,
          height: 540
        },
        'Hong Kong': {
          ...COUNTRY_VISUAL['Hong Kong'],
          center: { x: 0, y: 330 },
          width: 680,
          height: 540
        }
      };
    }

    return {
      'UK': {
        ...COUNTRY_VISUAL.UK,
        center: { x: -340, y: 0 },
        width: 520,
        height: 620
      },
      'Hong Kong': {
        ...COUNTRY_VISUAL['Hong Kong'],
        center: { x: 340, y: 0 },
        width: 520,
        height: 620
      }
    };
  }

  let viewportMode = isMobilePortraitMode() ? 'mobile-portrait' : 'desktop';
  let currentCountryLayout = buildCountryLayout(viewportMode);

  const peopleById = new Map(data.people.map(p => [p.id, p]));
  const familyGroups = buildFamilyGroups(data.relationships);
  const familyMembers = new Set(familyGroups.flatMap(group => group.members));

  const nodes = data.people.map(p => ({
    data: { id: p.id, label: p.name },
    classes: 'person'
  }));

  const locationGroups = Object.values(currentCountryLayout).map(country => ({
    data: {
      id: country.id,
      label: country.label,
      width: country.width,
      height: country.height,
      bgColor: country.color,
      borderColor: country.border,
      textColor: country.text
    },
    position: { ...country.center },
    classes: 'location-group'
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

  const cy = cytoscape({
    container: document.getElementById('cy'),
    elements: [...locationGroups, ...nodes, ...edges],
    style: [
      {
        selector: 'node.person',
        style: {
          'label': 'data(label)',
          'background-color': '#4a90e2',
          'color': '#fff',
          'text-valign': 'center',
          'text-halign': 'center',
          'font-size': '15px',
          'width': '64px',
          'height': '64px',
          'transition-property': 'opacity',
          'transition-duration': '0.3s'
        }
      },
      {
        selector: 'node.location-group',
        style: {
          'label': 'data(label)',
          'shape': 'round-rectangle',
          'width': 'data(width)',
          'height': 'data(height)',
          'background-color': 'data(bgColor)',
          'background-opacity': 0.12,
          'border-width': 3,
          'border-style': 'solid',
          'border-color': 'data(borderColor)',
          'text-valign': 'top',
          'text-halign': 'center',
          'font-size': '18px',
          'font-weight': 700,
          'color': 'data(textColor)',
          'padding': '20px',
          'events': 'no',
          'z-compound-depth': 'bottom'
        }
      },
      {
        selector: 'node.person.family-member',
        style: {
          'border-width': 4,
          'border-color': '#db2777',
          'border-style': 'dashed'
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
      }
    ],
    layout: { name: 'preset' }
  });

  cy.nodes('.location-group').forEach(n => {
    n.lock();
    n.ungrabify();
  });

  function updateLocationGroupNodes() {
    Object.values(currentCountryLayout).forEach(country => {
      const groupNode = cy.getElementById(country.id);
      if (groupNode.empty()) return;
      groupNode.data('width', country.width);
      groupNode.data('height', country.height);
      groupNode.position({ ...country.center });
    });
  }

  function buildCountryPositions(country, personIds, year) {
    const layout = currentCountryLayout[country] || currentCountryLayout.UK;
    const sortedIds = [...personIds].sort((a, b) => {
      return hashString(`${country}:${a}`) - hashString(`${country}:${b}`);
    });

    const count = sortedIds.length;
    const positions = new Map();
    if (!count) return positions;

    const compactMode = viewportMode === 'mobile-portrait';
    const horizontalPadding = compactMode
      ? (count <= 4 ? 76 : count <= 10 ? 60 : 46)
      : (count <= 4 ? 94 : count <= 10 ? 72 : 48);
    const verticalPadding = compactMode
      ? (count <= 4 ? 96 : count <= 10 ? 74 : 56)
      : (count <= 4 ? 118 : count <= 10 ? 90 : 64);
    const bounds = {
      minX: layout.center.x - layout.width / 2 + horizontalPadding,
      maxX: layout.center.x + layout.width / 2 - horizontalPadding,
      minY: layout.center.y - layout.height / 2 + verticalPadding,
      maxY: layout.center.y + layout.height / 2 - verticalPadding
    };
    const boundsWidth = bounds.maxX - bounds.minX;
    const boundsHeight = bounds.maxY - bounds.minY;

    const spreadWidth = clamp(
      Math.sqrt(count) * (compactMode ? 180 : 164),
      boundsWidth * (compactMode ? 0.72 : 0.64),
      boundsWidth
    );
    const spreadHeight = clamp(
      Math.sqrt(count) * (compactMode ? 170 : 150),
      boundsHeight * (compactMode ? 0.68 : 0.6),
      boundsHeight
    );
    const activeBounds = {
      minX: layout.center.x - spreadWidth / 2,
      maxX: layout.center.x + spreadWidth / 2,
      minY: layout.center.y - spreadHeight / 2,
      maxY: layout.center.y + spreadHeight / 2
    };

    const idSet = new Set(sortedIds);
    const activeEdges = data.relationships
      .filter(r => {
        return isRelationshipVisibleAtYear(r, year) && idSet.has(r.from) && idSet.has(r.to);
      })
      .map(r => ({
        source: r.from,
        target: r.to,
        weight: relationshipWeight(r.type)
      }));

    const adjacency = new Map(sortedIds.map(id => [id, new Set()]));
    activeEdges.forEach(edge => {
      adjacency.get(edge.source)?.add(edge.target);
      adjacency.get(edge.target)?.add(edge.source);
    });

    const clusters = [];
    const visited = new Set();

    sortedIds.forEach(personId => {
      if (visited.has(personId)) return;

      const queue = [personId];
      const members = [];
      visited.add(personId);

      while (queue.length) {
        const current = queue.shift();
        members.push(current);

        adjacency.get(current)?.forEach(neighbor => {
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            queue.push(neighbor);
          }
        });
      }

      const memberSet = new Set(members);
      clusters.push({
        members: members.sort((a, b) => hashString(`${country}:${a}`) - hashString(`${country}:${b}`)),
        edges: activeEdges.filter(edge => memberSet.has(edge.source) && memberSet.has(edge.target))
      });
    });

    clusters.sort((a, b) => {
      if (b.members.length !== a.members.length) return b.members.length - a.members.length;
      return hashString(`${country}:${a.members[0]}`) - hashString(`${country}:${b.members[0]}`);
    });

    const anchorByPerson = new Map();
    const radiusByPerson = new Map();
    const center = layout.center;
    const clusterCount = clusters.length;
    const activeWidth = activeBounds.maxX - activeBounds.minX;
    const activeHeight = activeBounds.maxY - activeBounds.minY;
    const outerClusterCount = Math.max(0, clusterCount - 1);
    const ringRadiusX = Math.max(0, activeWidth * 0.42);
    const ringRadiusY = Math.max(0, activeHeight * 0.42);

    clusters.forEach((cluster, index) => {
      let clusterCenter = { ...center };
      let clusterRadiusLimit = Math.min(activeWidth, activeHeight) * 0.42;

      if (index > 0) {
        const angle = (-Math.PI / 2) + ((2 * Math.PI * (index - 1)) / Math.max(1, outerClusterCount));
        const jitterX = ((hashString(`${country}:${cluster.members[0]}:x`) % 1000) / 1000) - 0.5;
        const jitterY = ((hashString(`${country}:${cluster.members[0]}:y`) % 1000) / 1000) - 0.5;
        const spokeSpacing = outerClusterCount > 1
          ? Math.min(ringRadiusX, ringRadiusY) * Math.PI / outerClusterCount
          : Math.min(activeWidth, activeHeight) * 0.26;

        clusterCenter = {
          x: center.x + (Math.cos(angle) * ringRadiusX) + (jitterX * 12),
          y: center.y + (Math.sin(angle) * ringRadiusY) + (jitterY * 10)
        };

        clusterRadiusLimit = Math.min(88, Math.max(0, spokeSpacing * 0.3));
      }

      const clusterRadius = clamp(
        64 + (Math.sqrt(cluster.members.length) * 54),
        cluster.members.length === 1 ? 0 : 64,
        Math.max(cluster.members.length === 1 ? 0 : 64, clusterRadiusLimit)
      );

      cluster.members.forEach(memberId => {
        anchorByPerson.set(memberId, clusterCenter);
        radiusByPerson.set(memberId, clusterRadius);
      });
    });

    clusters.forEach(cluster => {
      const memberCount = cluster.members.length;
      const clusterCenter = anchorByPerson.get(cluster.members[0]) || center;
      const clusterRadius = radiusByPerson.get(cluster.members[0]) || 120;

      cluster.members.forEach((personId, index) => {
        const angleOffset = (hashString(`${country}:${cluster.members[0]}:cluster`) % 360) * Math.PI / 180;
        const angle = memberCount === 1
          ? angleOffset
          : ((index * 2.399963229728653) + angleOffset);
        const radiusScale = memberCount === 1
          ? 0
          : Math.min(0.96, Math.sqrt((index + 0.5) / memberCount));
        positions.set(personId, {
          x: clusterCenter.x + (Math.cos(angle) * clusterRadius * radiusScale),
          y: clusterCenter.y + (Math.sin(angle) * clusterRadius * radiusScale)
        });
      });

      for (let iteration = 0; iteration < 160; iteration++) {
        const movement = new Map(cluster.members.map(id => [id, { x: 0, y: 0 }]));

        for (let i = 0; i < cluster.members.length; i++) {
          for (let j = i + 1; j < cluster.members.length; j++) {
            const a = cluster.members[i];
            const b = cluster.members[j];
            const posA = positions.get(a);
            const posB = positions.get(b);
            const dx = posB.x - posA.x;
            const dy = posB.y - posA.y;
            const dist = Math.max(1, Math.hypot(dx, dy));
            const force = Math.min(11, 7600 / (dist * dist));
            const offsetX = (dx / dist) * force;
            const offsetY = (dy / dist) * force;

            movement.get(a).x -= offsetX;
            movement.get(a).y -= offsetY;
            movement.get(b).x += offsetX;
            movement.get(b).y += offsetY;
          }
        }

        cluster.edges.forEach(edge => {
          const posA = positions.get(edge.source);
          const posB = positions.get(edge.target);
          const dx = posB.x - posA.x;
          const dy = posB.y - posA.y;
          const dist = Math.max(1, Math.hypot(dx, dy));
          const targetDistance = edge.weight >= 1.7
            ? clamp(clusterRadius * 0.9, 102, 138)
            : clamp(clusterRadius * 1.08, 122, 170);
          const spring = (dist - targetDistance) * 0.028 * edge.weight;
          const offsetX = (dx / dist) * spring;
          const offsetY = (dy / dist) * spring;

          movement.get(edge.source).x += offsetX;
          movement.get(edge.source).y += offsetY;
          movement.get(edge.target).x -= offsetX;
          movement.get(edge.target).y -= offsetY;
        });

        cluster.members.forEach(personId => {
          const pos = positions.get(personId);
          const anchor = anchorByPerson.get(personId) || center;
          const driftX = anchor.x - pos.x;
          const driftY = anchor.y - pos.y;

          movement.get(personId).x += driftX * 0.01;
          movement.get(personId).y += driftY * 0.01;
        });

        cluster.members.forEach(personId => {
          const pos = positions.get(personId);
          const delta = movement.get(personId);
          const anchor = anchorByPerson.get(personId) || center;
          let nextX = pos.x + (delta.x * 0.9);
          let nextY = pos.y + (delta.y * 0.9);
          const offsetX = nextX - anchor.x;
          const offsetY = nextY - anchor.y;
          const distanceFromAnchor = Math.hypot(offsetX, offsetY);

          if (distanceFromAnchor > clusterRadius) {
            const scale = clusterRadius / distanceFromAnchor;
            nextX = anchor.x + (offsetX * scale);
            nextY = anchor.y + (offsetY * scale);
          }

          positions.set(personId, {
            x: Math.min(bounds.maxX, Math.max(bounds.minX, nextX)),
            y: Math.min(bounds.maxY, Math.max(bounds.minY, nextY))
          });
        });
      }
    });

    for (let iteration = 0; iteration < 80; iteration++) {
      for (let i = 0; i < sortedIds.length; i++) {
        for (let j = i + 1; j < sortedIds.length; j++) {
          const a = sortedIds[i];
          const b = sortedIds[j];
          const posA = positions.get(a);
          const posB = positions.get(b);
          const dx = posB.x - posA.x;
          const dy = posB.y - posA.y;
          const dist = Math.max(1, Math.hypot(dx, dy));
          const minDistance = count <= 6 ? 144 : count <= 12 ? 134 : 124;

          if (dist >= minDistance) continue;

          const push = ((minDistance - dist) / 2) * 0.32;
          const pushX = (dx / dist) * push;
          const pushY = (dy / dist) * push;
          const anchorA = anchorByPerson.get(a) || center;
          const anchorB = anchorByPerson.get(b) || center;

          positions.set(a, {
            x: Math.min(bounds.maxX, Math.max(bounds.minX, posA.x - pushX + ((anchorA.x - posA.x) * 0.01))),
            y: Math.min(bounds.maxY, Math.max(bounds.minY, posA.y - pushY + ((anchorA.y - posA.y) * 0.01)))
          });

          positions.set(b, {
            x: Math.min(bounds.maxX, Math.max(bounds.minX, posB.x + pushX + ((anchorB.x - posB.x) * 0.01))),
            y: Math.min(bounds.maxY, Math.max(bounds.minY, posB.y + pushY + ((anchorB.y - posB.y) * 0.01)))
          });
        }
      }
    }

    return positions;
  }

  function applyLocationGrouping(year, options = {}) {
    const { animate = true } = options;
    const countryToPeople = new Map();

    cy.nodes('.person').forEach(node => {
      const person = peopleById.get(node.id());
      const country = getCountryAtYear(person?.locationHistory || [], year);
      node.data('country', country);

      if (!countryToPeople.has(country)) {
        countryToPeople.set(country, []);
      }

      countryToPeople.get(country).push(node.id());
    });

    const positionByPerson = new Map();
    countryToPeople.forEach((personIds, country) => {
      buildCountryPositions(country, personIds, year).forEach((position, personId) => {
        positionByPerson.set(personId, position);
      });
    });

    cy.nodes('.person').forEach(node => {
      const targetPosition = positionByPerson.get(node.id());
      if (!targetPosition) return;
      node.stop();

      if (animate) {
        node.animate({
          position: targetPosition,
          duration: 650,
          easing: 'ease-in-out-cubic'
        });
      } else {
        node.position(targetPosition);
      }
    });

    cy.fit(cy.elements(), viewportMode === 'mobile-portrait' ? 16 : 30);
  }

  // Center graph on clicked person
  cy.on('tap', 'node.person', evt => {
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
  const advancedControlsToggle = document.getElementById('toggleAdvancedControls');

  function setAdvancedControlsExpanded(expanded) {
    drawer.classList.toggle('show-advanced', expanded);
    if (advancedControlsToggle) {
      advancedControlsToggle.textContent = expanded ? 'Show fewer controls' : 'Show more controls';
      advancedControlsToggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    }
  }

  function syncModeClasses() {
    document.body.classList.toggle('mobile-portrait', viewportMode === 'mobile-portrait');
    document.body.classList.toggle('desktop-layout', viewportMode !== 'mobile-portrait');
    setAdvancedControlsExpanded(viewportMode !== 'mobile-portrait');
  }

  if (advancedControlsToggle) {
    advancedControlsToggle.addEventListener('click', () => {
      setAdvancedControlsExpanded(!drawer.classList.contains('show-advanced'));
    });
  }

  drawerToggle.addEventListener('click', () => {
    drawer.classList.toggle('open');
  });

  function closeDrawer() {
    drawer.classList.remove('open');
  }

  function setFamilyGrouping(enabled) {
    if (!familyGroups.length) return;

    familyMembers.forEach(memberId => {
      const memberNode = cy.getElementById(memberId);
      if (memberNode.nonempty()) {
        memberNode.toggleClass('family-member', enabled);
      }
    });
  }

  if (familyGroupingToggle) {
    familyGroupingToggle.addEventListener('change', () => {
      setFamilyGrouping(familyGroupingToggle.checked);
      closeDrawer();
    });

    familyGroupingToggle.checked = true;
  }

  setFamilyGrouping(true);

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
  let resizeTimer;

  function currentTimelineYear() {
    return parseInt(slider.value, 10);
  }

  function applyResponsiveLayout(year, options = {}) {
    const { animateLocations = true, force = false } = options;
    const nextMode = isMobilePortraitMode() ? 'mobile-portrait' : 'desktop';
    if (!force && nextMode === viewportMode) return false;

    viewportMode = nextMode;
    currentCountryLayout = buildCountryLayout(viewportMode);
    syncModeClasses();
    updateLocationGroupNodes();
    applyLocationGrouping(year, { animate: animateLocations });
    return true;
  }

  function applyTimeline(year, options = {}) {
    const { animateLocations = true } = options;

    yearLabel.textContent = `Showing relationships up to: ${year}`;
    const modeChanged = applyResponsiveLayout(year, { animateLocations, force: false });

    cy.edges().forEach(e => {
      const y = e.data('year');

      if (y === null || y <= year) {
        e.style('display', 'element');
      } else {
        e.style('display', 'none');
      }
    });

    if (!modeChanged) {
      applyLocationGrouping(year, { animate: animateLocations });
    }

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
    applyTimeline(currentTimelineYear());
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
      applyTimeline(year, { animateLocations: true });
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
    const louvain = cy.elements().difference(cy.nodes('.location-group')).louvain();
    const colors = ['#ffcccc', '#ccffcc', '#ccccff', '#fff0b3', '#e0ccff', '#ccf2ff'];

    cy.nodes('.person').forEach(n => {
      const cid = louvain[n.id()];
      if (cid !== undefined) {
        n.style('background-color', colors[cid % colors.length]);
      }
    });

    closeDrawer();
  });

  clearClusteringBtn.addEventListener('click', () => {
    cy.nodes('.person').forEach(n => n.style('background-color', '#4a90e2'));
    closeDrawer();
  });

  // Theme toggle
  const themeToggle = document.getElementById('themeToggle');
  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    document.body.classList.toggle('light');
  });

  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      applyResponsiveLayout(currentTimelineYear(), { animateLocations: false, force: true });
    }, 120);
  });

  syncModeClasses();
  updateLocationGroupNodes();
  applyTimeline(currentTimelineYear(), { animateLocations: false });
}

loadGraph();
