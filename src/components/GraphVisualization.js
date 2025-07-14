import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

const GraphVisualization = ({ vertices, edges, path, pathType, onEdgeUpdate, onEdgeDelete }) => {
  const svgRef = useRef(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [editWeight, setEditWeight] = useState('');
  const [currentStep, setCurrentStep] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  // Références pour les éléments D3
  const [circles, setCircles] = useState(null);
  const [labels, setLabels] = useState(null);
  const [svg, setSvg] = useState(null);

  // Déplacer createArcPath au niveau du composant
  const createArcPath = (d) => {
    if (!d || !d.source || !d.target) return '';
    
    const curve = d.curve || 0;
    
    if (curve === 0) return `M ${d.source.x} ${d.source.y} L ${d.target.x} ${d.target.y}`;
    
    const dx = d.target.x - d.source.x;
    const dy = d.target.y - d.source.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const midX = (d.source.x + d.target.x) / 2;
    const midY = (d.source.y + d.target.y) / 2;
    const perpX = -dy / distance;
    const perpY = dx / distance;
    const offsetDistance = Math.min(distance * 0.2, 40);
    const controlX = midX + perpX * curve * offsetDistance;
    const controlY = midY + perpY * curve * offsetDistance;
    return `M ${d.source.x} ${d.source.y} Q ${controlX} ${controlY} ${d.target.x}`;
  };

  // Déplacer getTextPosition au niveau du composant
  const getTextPosition = (d) => {
    if (!d || !d.source || !d.target) return { x: 0, y: 0 };

    if (d.curve === 0) {
      const midX = (d.source.x + d.target.x) / 2;
      const midY = (d.source.y + d.target.y) / 2;
      const dx = d.target.x - d.source.x;
      const dy = d.target.y - d.source.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return { x: midX + (dy * 12) / distance, y: midY - (dx * 12) / distance };
    } else {
      const dx = d.target.x - d.source.x;
      const dy = d.target.y - d.source.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const midX = (d.source.x + d.target.x) / 2;
      const midY = (d.source.y + d.target.y) / 2;
      const perpX = -dy / distance;
      const perpY = dx / distance;
      const offsetDistance = Math.min(distance * 0.2, 40);
      const controlX = midX + perpX * d.curve * offsetDistance;
      const controlY = midY + perpY * d.curve * offsetDistance;
      const t = 0.5;
      const x = (1 - t) * (1 - t) * d.source.x + 2 * (1 - t) * t * controlX + t * t * d.target.x;
      const y = (1 - t) * (1 - t) * d.source.y + 2 * (1 - t) * t * controlY + t * t * d.target.y;
      return { x, y };
    }
  };

  // Mettre à jour updatePositions qui peut maintenant utiliser createArcPath et getTextPosition
  const updatePositions = () => {
    if (!circles || !labels || !svg) return;

    circles.attr('cx', d => d.x || d.fx)
          .attr('cy', d => d.y || d.fy);
    
    labels.attr('x', d => d.x || d.fx)
         .attr('y', d => d.y || d.fy);

    svg.selectAll('path')
      .filter(d => d && d.source && d.target)
      .attr('d', createArcPath);

    svg.selectAll('text:not(.node-label)')
      .filter(d => d && d.source && d.target)
      .each(function(d) {
        if (d && d.source && d.target) {
          const pos = getTextPosition(d);
          d3.select(this)
            .attr('x', pos.x)
            .attr('y', pos.y);
        }
      });
  };

  const drag = (simulation) => {
    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fixed = true;
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }
  
    function dragged(event) {
      const node = event.subject;
      const svgElement = d3.select(svgRef.current);
      
      // Mettre à jour les coordonnées fixes du nœud
      node.fx = event.x;
      node.fy = event.y;
  
      // Mettre à jour le cercle
      d3.select(event.sourceEvent.target)
        .attr('cx', event.x)
        .attr('cy', event.y);
  
      // Mettre à jour le label du nœud en sélectionnant la classe spécifique
      svgElement.selectAll('text')
        .filter(d => d && d.id === node.id)
        .attr('x', event.x)
        .attr('y', event.y);
  
      // Mettre à jour les arêtes connectées
      svgElement.selectAll('path')
        .filter(d => d && d.source && d.target && 
          (d.source.id === node.id || d.target.id === node.id))
        .attr('d', d => {
          if (d.source.id === node.id) {
            d.source.x = event.x;
            d.source.y = event.y;
          }
          if (d.target.id === node.id) {
            d.target.x = event.x;
            d.target.y = event.y;
          }
          return createArcPath(d);
        });
  
      // Mettre à jour les labels des arêtes
      svgElement.selectAll('text:not(.node-label)')
        .filter(d => d && d.source && d.target && 
          (d.source.id === node.id || d.target.id === node.id))
        .each(function(d) {
          if (d.source.id === node.id) {
            d.source.x = event.x;
            d.source.y = event.y;
          }
          if (d.target.id === node.id) {
            d.target.x = event.x;
            d.target.y = event.y;
          }
          const pos = getTextPosition(d);
          d3.select(this)
            .attr('x', pos.x)
            .attr('y', pos.y);
        });
  
      // Forcer la mise à jour des positions
      updatePositions();
    }
  
    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0);
      const node = event.subject;
      node.x = node.fx;
      node.y = node.fy;
      node.fixed = true;
    }
  
    return d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
  };

  const handleResize = () => {
    if (!edges.length || !svgRef.current) return;
    renderGraph();
  };

  const startAnimation = () => {
    if (!path || !path.path || path.path.length === 0) return;

    setIsPlaying(true);
    setCurrentStep(-1);

    let step = -1;
    const interval = setInterval(() => {
      step++;
      if (step >= path.path.length) {
        clearInterval(interval);
        setIsPlaying(false);
      } else {
        setCurrentStep(step);
      }
    }, 700);
  };

  const renderGraph = () => {
    if (!edges.length || !svgRef.current) return;

    d3.select(svgRef.current).selectAll("*").remove();

    const containerWidth = svgRef.current.parentElement.clientWidth;
    const width = Math.min(containerWidth, 1200);
    const height = Math.min(width / 2, 600);
    const nodeRadius = Math.max(15, Math.min(30, width / 40));

    const scaleX = width / 1200;
    const scaleY = height / 600;

    const svg = d3.select(svgRef.current)
      .attr('width', '100%')
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    setSvg(svg);

    const nodes = Array.from({ length: vertices }, (_, i) => ({ id: i }));

    const baseNodePositions = {
      0: { x: 70, y: 250 }, 1: { x: 200, y: 250 }, 2: { x: 300, y: 350 },
      3: { x: 300, y: 150 }, 4: { x: 450, y: 120 }, 5: { x: 450, y: 250 },
      6: { x: 550, y: 280 }, 7: { x: 650, y: 180 }, 8: { x: 550, y: 120 },
      9: { x: 650, y: 280 }, 10: { x: 550, y: 400 }, 11: { x: 750, y: 280 },
      12: { x: 750, y: 400 }, 13: { x: 850, y: 280 }, 14: { x: 950, y: 180 },
      15: { x: 1100, y: 250 }, 16: { x: 1100, y: 400 }, 17: { x: 950, y: 350 },
      18: { x: 850, y: 450 }, 19: { x: 750, y: 150 }, 20: { x: 650, y: 80 },
      21: { x: 450, y: 400 }, 22: { x: 300, y: 450 }, 23: { x: 200, y: 400 },
      24: { x: 70, y: 400 }
    };

    const nodePositions = {};
    Object.keys(baseNodePositions).forEach(id => {
      nodePositions[id] = {
        x: baseNodePositions[id].x * scaleX,
        y: baseNodePositions[id].y * scaleY
      };
    });

    nodes.forEach(node => {
      if (nodePositions[node.id]) {
        node.x = nodePositions[node.id].x;
        node.y = nodePositions[node.id].y;
        node.fx = node.x;
        node.fy = node.y;
      }
    });

    const arcs = edges.map(edge => ({
      source: nodes.find(n => n.id === edge.source),
      target: nodes.find(n => n.id === edge.destination),
      weight: edge.weight,
      isPathEdge: false,
      sourceId: edge.source,
      targetId: edge.destination
    }));

    arcs.forEach((arc, i) => {
      const reverseArc = arcs.find((other, j) =>
        j !== i &&
        other.sourceId === arc.targetId &&
        other.targetId === arc.sourceId
      );
      if (reverseArc) {
        const isFirstArc = arcs.indexOf(arc) < arcs.indexOf(reverseArc);
        arc.curve = isFirstArc ? -0.15 : 0.15;
      } else {
        arc.curve = 0;
      }
    });

    if (path && path.path) {
      arcs.forEach(arc => {
        arc.isPathEdge = false;
        for (let step = 0; step <= currentStep; step++) {
          const p = path.path[step];
          if (p && p.from === arc.source.id && p.to === arc.target.id) {
            arc.isPathEdge = true;
            break;
          }
        }
      });
    }

    const defs = svg.append('defs');

    defs.append('marker')
      .attr('id', 'arrow-normal')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', nodeRadius + 12)
      .attr('refY', 0)
      .attr('markerWidth', 10)
      .attr('markerHeight', 10)
      .attr('orient', 'auto')
      .append('path').attr('d', 'M0,-5L10,0L0,5').attr('fill', '#666');

    defs.append('marker')
      .attr('id', 'arrow-min')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', nodeRadius + 12)
      .attr('refY', 0)
      .attr('markerWidth', 10)
      .attr('markerHeight', 10)
      .attr('orient', 'auto')
      .append('path').attr('d', 'M0,-5L10,0L0,5').attr('fill', '#ff0000');

    defs.append('marker')
      .attr('id', 'arrow-max')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', nodeRadius + 12)
      .attr('refY', 0)
      .attr('markerWidth', 10)
      .attr('markerHeight', 10)
      .attr('orient', 'auto')
      .append('path').attr('d', 'M0,-5L10,0L0,5').attr('fill', '#00ff00');

    svg.append('g').selectAll('path')
      .data(arcs)
      .enter().append('path')
      .attr('d', createArcPath)
      .attr('stroke-width', 1)
      .attr('stroke', d => {
        if (d.isPathEdge) return pathType === 'min' ? '#ff0000' : '#00ff00';
        return '#999';
      })
      .attr('fill', 'none')
      .attr('marker-end', d => {
        if (d.isPathEdge) return pathType === 'min' ? 'url(#arrow-min)' : 'url(#arrow-max)';
        return 'url(#arrow-normal)';
      })
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        const edge = edges.find(e => e.source === d.sourceId && e.destination === d.targetId);
        if (edge && onEdgeUpdate) onEdgeUpdate(edge);
      });

    svg.append('g').selectAll('text')
      .data(arcs)
      .enter().append('text')
      .text(d => d.weight)
      .attr('font-size', 16)
      .attr('font-weight', 'bold')
      .attr('fill', '#333')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('x', d => getTextPosition(d).x)
      .attr('y', d => getTextPosition(d).y)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        const edge = edges.find(e => e.source === d.sourceId && e.destination === d.targetId);
        if (edge && onEdgeUpdate) onEdgeUpdate(edge);
      });

    // Modifier la simulation pour qu'elle soit plus stable
    const simulation = d3.forceSimulation(nodes)
      .force("x", d3.forceX(d => d.x).strength(0.1))
      .force("y", d3.forceY(d => d.y).strength(0.1))
      .alphaDecay(0.02) // Ralentir la décroissance de l'alpha
      .velocityDecay(0.4); // Augmenter l'amortissement

    const circles = svg.append('g')
      .selectAll('circle')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('r', nodeRadius)
      .attr('stroke', '#d62728')
      .attr('stroke-width', 2)
      .attr('fill', d => {
        if (d.id === 0 || d.id === vertices - 1) return '#1f77b4';
        if (path && path.path && currentStep >= 0) {
          const inSteps = path.path.slice(0, currentStep + 1).some(p => p.from === d.id || p.to === d.id);
          if (inSteps) return '#ffcc00';
        }
        return 'white';
      })
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .style('cursor', 'move')
      .call(drag(simulation)); // Appliquer le drag ici uniquement

    setCircles(circles);

    const labels = svg.append('g').selectAll('text.node-label')
      .data(nodes)
      .enter().append('text')
      .attr('class', 'node-label') // Ajouter une classe pour identifier les labels des nœuds
      .text(d => `x${d.id + 1}`)
      .attr('font-size', 14)
      .attr('font-weight', 'bold')
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .attr('fill', d => (d.id === 0 || d.id === vertices - 1) ? 'white' : 'black')
      .attr('x', d => d.x)
      .attr('y', d => d.y);

    setLabels(labels);

    // Écouter les ticks de la simulation
    simulation.on('tick', updatePositions);
  };

  useEffect(() => {
    renderGraph();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [vertices, edges, path, pathType, currentStep]); // currentStep pour animation

  return (
    <div className="border rounded p-4 bg-white w-full overflow-hidden">
      <h2 className="font-bold mb-2">Visualisation du Graphe :</h2>
      <div className="w-full overflow-auto">
        <svg ref={svgRef} className="w-full" style={{ minHeight: '400px', maxHeight: '80vh' }}></svg>
      </div>
      <div className="flex justify-center mt-4">
        <button
          onClick={startAnimation}
          disabled={isPlaying || !path || !path.path || path.path.length === 0}
          className={`px-4 py-2 rounded bg-green-500 text-white hover:bg-green-600 ${isPlaying ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isPlaying ? "Animation en cours..." : "Démarrer l'animation"}
        </button>
      </div>
    </div>
  );
};

export default GraphVisualization;
