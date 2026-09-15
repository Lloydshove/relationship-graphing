async function loadGraph() {
  const data = await fetch('./data/relationships.json').then(r => r.json());
  const DEFAULT_TIMELINE_YEAR = 2018;

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
      ? (count <= 4 ? 56 : count <= 10 ? 42 : 30)
      : (count <= 4 ? 70 : count <= 10 ? 54 : 34);
    const verticalPadding = compactMode
      ? (count <= 4 ? 76 : count <= 10 ? 58 : 42)
      : (count <= 4 ? 94 : count <= 10 ? 70 : 50);
    const bounds = {
      minX: layout.center.x - layout.width / 2 + horizontalPadding,
      maxX: layout.center.x + layout.width / 2 - horizontalPadding,
      minY: layout.center.y - layout.height / 2 + verticalPadding,
      maxY: layout.center.y + layout.height / 2 - verticalPadding
    };
    const boundsWidth = bounds.maxX - bounds.minX;
    const boundsHeight = bounds.maxY - bounds.minY;

    const spreadWidth = clamp(
      Math.sqrt(count) * (compactMode ? 206 : 188),
      boundsWidth * (compactMode ? 0.82 : 0.76),
      boundsWidth
    );
    const spreadHeight = clamp(
      Math.sqrt(count) * (compactMode ? 194 : 174),
      boundsHeight * (compactMode ? 0.78 : 0.72),
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

        clusterRadiusLimit = Math.min(96, Math.max(0, spokeSpacing * 0.32));
      }

      const clusterRadius = clamp(
        74 + (Math.sqrt(cluster.members.length) * 58),
        cluster.members.length === 1 ? 0 : 74,
        Math.max(cluster.members.length === 1 ? 0 : 74, clusterRadiusLimit)
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

      for (let iteration = 0; iteration < 190; iteration++) {
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
            const force = Math.min(16, 13200 / (dist * dist));
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
            ? clamp(clusterRadius * 0.92, 110, 156)
            : clamp(clusterRadius * 1.1, 130, 184);
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

          movement.get(personId).x += driftX * 0.005;
          movement.get(personId).y += driftY * 0.005;
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

    const preferredSpacing = count <= 6 ? 172 : count <= 12 ? 156 : 142;
    for (let iteration = 0; iteration < 120; iteration++) {
      const movement = new Map(sortedIds.map(id => [id, { x: 0, y: 0 }]));
      for (let i = 0; i < sortedIds.length; i++) {
        for (let j = i + 1; j < sortedIds.length; j++) {
          const a = sortedIds[i];
          const b = sortedIds[j];
          const posA = positions.get(a);
          const posB = positions.get(b);
          const dx = posB.x - posA.x;
          const dy = posB.y - posA.y;
          const dist = Math.max(1, Math.hypot(dx, dy));
          if (dist >= preferredSpacing) continue;
          const push = ((preferredSpacing - dist) / 2) * 0.44;
          const pushX = (dx / dist) * push;
          const pushY = (dy / dist) * push;

          movement.get(a).x -= pushX;
          movement.get(a).y -= pushY;
          movement.get(b).x += pushX;
          movement.get(b).y += pushY;
        }
      }

      sortedIds.forEach(personId => {
        const pos = positions.get(personId);
        const delta = movement.get(personId);
        const anchor = anchorByPerson.get(personId) || center;
        const nextX = pos.x + delta.x + ((anchor.x - pos.x) * 0.006);
        const nextY = pos.y + delta.y + ((anchor.y - pos.y) * 0.006);

        positions.set(personId, {
          x: Math.min(bounds.maxX, Math.max(bounds.minX, nextX)),
          y: Math.min(bounds.maxY, Math.max(bounds.minY, nextY))
        });
      });
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
  const drawerClose = document.getElementById('drawerClose');
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

  if (drawerClose) {
    drawerClose.addEventListener('click', closeDrawer);
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
  const yearBadge = document.getElementById('currentYearBadge');
  const playBtn = document.getElementById('playTimeline');
  const stepBackBtn = document.getElementById('timelineStepBack');
  const stepForwardBtn = document.getElementById('timelineStepForward');
  let resizeTimer;
  let sliderInputTimer = null;
  let timelinePlaybackTimer = null;

  function updateVisibleYear(year) {
    yearLabel.textContent = `Showing relationships up to: ${year}`;
    if (yearBadge) yearBadge.textContent = `Year: ${year}`;
  }

  function currentTimelineYear() {
    return parseInt(slider.value, 10);
  }

  function updatePlaybackUi(isPlaying) {
    if (!playBtn) return;
    playBtn.textContent = isPlaying ? '⏸ Pause' : '▶ Play';
    playBtn.setAttribute('aria-label', isPlaying ? 'Pause timeline' : 'Play timeline');
    playBtn.setAttribute('aria-pressed', isPlaying ? 'true' : 'false');
  }

  function stopTimelinePlayback() {
    if (timelinePlaybackTimer !== null) {
      clearInterval(timelinePlaybackTimer);
      timelinePlaybackTimer = null;
    }
    updatePlaybackUi(false);
  }

  function setTimelineYear(year, options = {}) {
    slider.value = String(year);
    applyTimeline(year, options);
  }

  function stepTimeline(delta, options = {}) {
    const { stopPlayback = true, animateLocations = true } = options;
    if (stopPlayback) stopTimelinePlayback();
    const min = parseInt(slider.min, 10);
    const max = parseInt(slider.max, 10);
    const nextYear = clamp(currentTimelineYear() + delta, min, max);
    setTimelineYear(nextYear, { animateLocations });
    return nextYear;
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

    updateVisibleYear(year);
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
    stopTimelinePlayback();
    updateVisibleYear(currentTimelineYear());
    if (sliderInputTimer !== null) {
      clearTimeout(sliderInputTimer);
    }
    sliderInputTimer = setTimeout(() => {
      sliderInputTimer = null;
      applyTimeline(currentTimelineYear());
    }, 90);
  });

  slider.addEventListener('change', () => {
    if (sliderInputTimer !== null) {
      clearTimeout(sliderInputTimer);
      sliderInputTimer = null;
    }
    applyTimeline(currentTimelineYear());
  });

  if (stepBackBtn) {
    stepBackBtn.addEventListener('click', () => {
    stepTimeline(-1);
    });
  }

  if (stepForwardBtn) {
    stepForwardBtn.addEventListener('click', () => {
    stepTimeline(1);
    });
  }

  if (playBtn) {
    playBtn.addEventListener('click', () => {
    if (timelinePlaybackTimer !== null) {
      stopTimelinePlayback();
      return;
    }

    updatePlaybackUi(true);
    const min = parseInt(slider.min, 10);
    const max = parseInt(slider.max, 10);
    if (currentTimelineYear() >= max) {
      setTimelineYear(min, { animateLocations: true });
    }

    timelinePlaybackTimer = setInterval(() => {
      const currentYear = currentTimelineYear();
      const nextYear = currentYear + 1;

      if (nextYear > max) {
        stopTimelinePlayback();
        return;
      }

      stepTimeline(1, { stopPlayback: false, animateLocations: true });

      if (nextYear >= max) {
        stopTimelinePlayback();
      }
    }, 420);
    });
  }

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

  slider.value = String(clamp(DEFAULT_TIMELINE_YEAR, parseInt(slider.min, 10), parseInt(slider.max, 10)));
  syncModeClasses();
  updateLocationGroupNodes();
  applyTimeline(currentTimelineYear(), { animateLocations: false });
}

loadGraph();
