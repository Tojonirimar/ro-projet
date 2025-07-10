import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

const GraphVisualization = ({ vertices, edges, path, pathType, onEdgeUpdate, onEdgeDelete }) => {
  const svgRef = useRef(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [editWeight, setEditWeight] = useState('');
  const [currentStep, setCurrentStep] = useState(-1); // Animation étape actuelle
  const [isPlaying, setIsPlaying] = useState(false);

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

    const nodes = Array.from({ length: vertices }, (_, i) => ({ id: i }));

    const baseNodePositions = {
      0: { x: 70, y: 250 }, 1: { x: 200, y: 250 }, 2: { x: 300, y: 350 },
      3: { x: 300, y: 150 }, 4: { x: 450, y: 120 }, 5: { x: 450, y: 250 },
      6: { x: 550, y: 280 }, 7: { x: 650, y: 180 }, 8: { x: 550, y: 120 },
      9: { x: 650, y: 280 }, 10: { x: 550, y: 400 }, 11: { x: 750, y: 280 },
      12: { x: 750, y: 400 }, 13: { x: 850, y: 280 }, 14: { x: 950, y: 180 },
      15: { x: 1100, y: 250 }
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

    const createArcPath = (d) => {
      if (d.curve === 0) return `M ${d.source.x} ${d.source.y} L ${d.target.x} ${d.target.y}`;
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
      return `M ${d.source.x} ${d.source.y} Q ${controlX} ${controlY} ${d.target.x} ${d.target.y}`;
    };

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

    const getTextPosition = (d) => {
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

    svg.append('g').selectAll('circle')
      .data(nodes)
      .enter().append('circle')
      .attr('r', nodeRadius)
      .attr('stroke', '#d62728')
      .attr('stroke-width', 2)
      .attr('fill', d => {
        if (d.id === 0 || d.id === 15) return '#1f77b4'; // sommet départ/arrivée fixes

        if (path && path.path && currentStep >= 0) {
          // Parcourt le chemin jusqu'à l'étape actuelle incluse
          const inSteps = path.path.slice(0, currentStep + 1).some(p => p.from === d.id || p.to === d.id);
          if (inSteps) return '#ffcc00'; // sommet déjà traversé
        }

        return 'white'; // non parcouru
      })

      .attr('cx', d => d.x)
      .attr('cy', d => d.y);

    svg.append('g').selectAll('text.node-label')
      .data(nodes)
      .enter().append('text')
      .text(d => `x${d.id + 1}`)
      .attr('font-size', 14)
      .attr('font-weight', 'bold')
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .attr('fill', d => (d.id === 0 || d.id === 15) ? 'white' : 'black')
      .attr('x', d => d.x)
      .attr('y', d => d.y);
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
