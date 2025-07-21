import React, { useState, useEffect } from 'react';
import GraphVisualization from './GraphVisualization';
import GraphPath from '../utils/GraphPath';
import Swal from 'sweetalert2';

// Icônes SVG intégrées
const PlayIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6 4h1m4 0h1M4 4h16v16H4z" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const TargetIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const MapPinIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const ZapIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const CalculatorIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const ChevronUpIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
  </svg>
);

const GraphInterface = () => {
  const [vertexCount, setVertexCount] = useState(5); // 5 sommets par défaut
  const [edges, setEdges] = useState([]);
  const [pathType, setPathType] = useState('min');
  const [startVertex, setStartVertex] = useState(0);
  const [endVertex, setEndVertex] = useState(4); // correspond à 5 sommets
  const [edgeWeight, setEdgeWeight] = useState(1);
  const [result, setResult] = useState('');
  const [pathResult, setPathResult] = useState(null);
  const [calculationSteps, setCalculationSteps] = useState([]);
  const [currentStepTable, setCurrentStepTable] = useState(-1);
  const [currentColumn, setCurrentColumn] = useState(0);
  const [animationTrigger, setAnimationTrigger] = useState(0);
  const [showEdges, setShowEdges] = useState(true);
  const [showSteps, setShowSteps] = useState(true);

  useEffect(() => {
    if (endVertex >= vertexCount) {
      setEndVertex(vertexCount - 1);
    }
  }, [vertexCount, endVertex]);

  const handleAddEdge = () => {
    if (startVertex !== endVertex) {
      const newEdge = { source: parseInt(startVertex), destination: parseInt(endVertex), weight: parseInt(edgeWeight) };
      setEdges([...edges, newEdge]);
    }
  };

  const calculatePath = () => {
    const graph = new GraphPath(vertexCount, pathType);
    edges.forEach(edge => graph.addEdge(edge.source, edge.destination, edge.weight));
    if (pathType === 'max') graph.removeCycles();

    const paths = graph.findPath(parseInt(startVertex));
    const pathResult = graph.reconstructPath(parseInt(startVertex), parseInt(endVertex));

    setPathResult(pathResult);
    setAnimationTrigger(prev => prev + 1);

    const allCalculationSteps = graph.allSteps.map(step => {
      const i = step.from + 1;
      const j = step.to + 1;
      const weight = step.weight;
      const prevValueDisplay = step.prevValue === Infinity ? '∞' : step.prevValue === -Infinity ? '-∞' : step.prevValue;
      const newValueDisplay = step.newValue === Infinity ? '∞' : step.newValue === -Infinity ? '-∞' : step.newValue;

      const lambdaI = step.from === parseInt(startVertex) ? 0 :
        graph.allSteps.filter(s => s.to === step.from && s.isUpdated)
          .reduce((latest, s) => s.iteration > latest.iteration ? s : latest, { iteration: 0 }).newValue ||
        (pathType === 'min' ? Infinity : 0);

      const formattedLambdaI = lambdaI === Infinity ? '∞' : lambdaI === -Infinity ? '-∞' : lambdaI;

      let diffResult;
      if (prevValueDisplay === '∞' || formattedLambdaI === '∞') diffResult = '∞';
      else if (prevValueDisplay === '-∞' || formattedLambdaI === '-∞') diffResult = '-∞';
      else diffResult = step.prevValue - lambdaI;

      const diffValue = `${prevValueDisplay} - ${formattedLambdaI} = ${diffResult}`;
      const valueUpdate = `${formattedLambdaI} + ${weight} = ${newValueDisplay}`;

      return { i, j, diffValue, weight, newValue: valueUpdate, isUpdated: step.isUpdated };
    });

    // Trier les étapes par i puis par j
    const sortedSteps = allCalculationSteps.sort((a, b) => {
      if (a.i === b.i) return a.j - b.j;
      return a.i - b.i;
    });

    setCalculationSteps(sortedSteps);

    setCurrentStepTable(-1);
    setCurrentColumn(0);

    // Animation pas à pas
    let step = -1;
    let column = 0;
    const maxColumns = 5;
    const interval = setInterval(() => {
      if (column >= maxColumns) {
        column = 0;
        step++;
      }
      if (step >= allCalculationSteps.length) {
        clearInterval(interval);
        return;
      }
      setCurrentStepTable(step);
      setCurrentColumn(column);
      column++;
    }, 600);

    const resultText = `
Chemin ${pathType === 'min' ? 'minimal' : 'maximal'} de x${parseInt(startVertex) + 1} à x${parseInt(endVertex) + 1}:

Longueur totale : ${paths[endVertex]}

Chemin :
${[parseInt(startVertex), ...pathResult.path.map(p => p.to)].map(v => `x${v + 1}`).join(' -> ')}

Détails des étapes :
${pathResult.path.map(step => `x${step.from + 1} -> x${step.to + 1} (poids: ${step.weight})`).join('\n')}`;
    setResult(resultText);
  };

  const vertexOptions = Array.from({ length: vertexCount }, (_, i) => (
    <option key={i} value={i}>{`x${i + 1}`}</option>
  ));

  const handleEdgeUpdate = updatedEdge => openEditPopup(updatedEdge);
  const handleEdgeDelete = edgeToDelete => openDeletePopup(edgeToDelete);

  const updateEdge = (edge, newWeight) => {
    setEdges(edges.map(e => e.source === edge.source && e.destination === edge.destination ? { ...e, weight: newWeight } : e));
    setTimeout(() => calculatePath(), 100);
  };

  const deleteEdge = (edge) => {
    setEdges(edges.filter(e => !(e.source === edge.source && e.destination === edge.destination)));
    setTimeout(() => calculatePath(), 100);
  };

  const openEditPopup = edge => {
    Swal.fire({
      title: `Modifier x${edge.source + 1} → x${edge.destination + 1}`,
      html: `
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2">Poids de l'arc :</label>
          <input id="swal-input-weight" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="number" value="${edge.weight}">
        </div>`,
      showCancelButton: true,
      confirmButtonText: 'Mettre à jour',
      cancelButtonText: 'Annuler',
      preConfirm: () => {
        const weight = document.getElementById('swal-input-weight').value;
        if (!weight || isNaN(weight) || parseInt(weight) <= 0) {
          Swal.showValidationMessage('Veuillez entrer un poids valide (nombre positif)');
          return false;
        }
        return parseInt(weight);
      }
    }).then(result => {
      if (result.isConfirmed) {
        updateEdge(edge, result.value);
        Swal.fire({ title: 'Mis à jour!', text: `Arc mis à jour avec poids ${result.value}`, icon: 'success', timer: 1500, showConfirmButton: false });
      }
    });
  };

  const openDeletePopup = edge => {
    Swal.fire({
      title: 'Êtes-vous sûr?',
      html: `Supprimer l'arc <strong>x${edge.source + 1} → x${edge.destination + 1}</strong> (poids: ${edge.weight}) ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer!',
      cancelButtonText: 'Annuler',
    }).then(result => {
      if (result.isConfirmed) {
        deleteEdge(edge);
        Swal.fire({ title: 'Supprimé!', text: "L'arc a été supprimé.", icon: 'success', timer: 1500, showConfirmButton: false });
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      {/* Header avec gradient moderne */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 text-white shadow-xl">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <TargetIcon />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">FORD</h1>
          </div>

          {/* Panneau de contrôle principal */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Configuration du graphe */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <SettingsIcon />
                  <span className="ml-2">Configuration du Graphe</span>
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-white/90">Nombre de Sommets</label>
                    <input
                      type="number"
                      min="2"
                      max="20"
                      className="w-full p-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent backdrop-blur-sm"
                      value={vertexCount}
                      onChange={e => setVertexCount(parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-white/90">Type de Chemin</label>
                    <select
                      className="w-full p-3 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent backdrop-blur-sm"
                      value={pathType}
                      onChange={e => setPathType(e.target.value)}
                    >
                      <option value="min" className="text-gray-800">Chemin Minimal</option>
                      <option value="max" className="text-gray-800">Chemin Maximal</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Ajout d'arêtes */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <PlusIcon />
                  <span className="ml-2">Ajouter une Arête</span>
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-white/90">
                      <MapPinIcon />
                      <span className="ml-1">Départ</span>
                    </label>
                    <select
                      className="w-full p-3 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
                      value={startVertex}
                      onChange={e => setStartVertex(parseInt(e.target.value))}
                    >
                      {vertexOptions}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-white/90">
                      <TargetIcon />
                      <span className="ml-1">Arrivée</span>
                    </label>
                    <select
                      className="w-full p-3 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
                      value={endVertex}
                      onChange={e => setEndVertex(parseInt(e.target.value))}
                    >
                      {vertexOptions}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-white/90">
                      <ZapIcon />
                      <span className="ml-1">Poids</span>
                    </label>
                    <input
                      type="number"
                      className="w-full p-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
                      value={edgeWeight}
                      onChange={e => setEdgeWeight(parseInt(e.target.value))}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                className="flex items-center px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                onClick={handleAddEdge}
              >
                <PlusIcon />
                <span className="ml-2">Ajouter Arête</span>
              </button>
              <button
                className="flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                onClick={calculatePath}
              >
                <PlayIcon />
                <span className="ml-2">Calculer le Chemin</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="container mx-auto px-6 py-8">
        {/* Section des arêtes */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div
              className="bg-gradient-to-r from-slate-50 to-slate-100 p-4 cursor-pointer hover:from-slate-100 hover:to-slate-200 transition-all duration-200"
              onClick={() => setShowEdges(!showEdges)}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800 flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-3">
                    <SettingsIcon />
                  </div>
                  Arêtes du Graphe ({edges.length})
                </h2>
                {showEdges ? <ChevronUpIcon /> : <ChevronDownIcon />}
              </div>
            </div>

            {showEdges && (
              <div className="p-6">
                {edges.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <PlusIcon />
                    </div>
                    <p className="text-gray-500 text-lg">Aucune arête définie</p>
                    <p className="text-gray-400 text-sm mt-2">Ajoutez des arêtes pour construire votre graphe</p>
                  </div>
                ) : (
                  <div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto"
                    style={{ maxHeight: '320px' }} // Ajuste la hauteur max selon ton besoin
                  >
                    {edges.map((edge, index) => (
                      <div key={index} className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200 hover:shadow-lg transition-all duration-200 group">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                              <span className="text-white font-bold text-sm">x{edge.source + 1}</span>
                            </div>
                            <div className="text-slate-400">→</div>
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                              <span className="text-white font-bold text-sm">x{edge.destination + 1}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-slate-600">Poids</div>
                            <div className="text-lg font-bold text-slate-800">{edge.weight}</div>
                          </div>
                        </div>
                        <div className="flex justify-end mt-3 space-x-2">
                          <button
                            className="p-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors duration-200"
                            onClick={() => openEditPopup(edge)}
                          >
                            <EditIcon />
                          </button>
                          <button
                            className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200"
                            onClick={() => openDeletePopup(edge)}
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Étapes de calcul */}
        {calculationSteps.filter(step => step.isUpdated).length > 0 && (
          <div className="mb-8">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 cursor-pointer hover:from-emerald-100 hover:to-teal-100 transition-all duration-200"
                onClick={() => setShowSteps(!showSteps)}
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-800 flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center mr-3">
                      <CalculatorIcon />
                    </div>
                    Étapes de Calcul
                  </h2>
                  {showSteps ? <ChevronUpIcon /> : <ChevronDownIcon />}
                </div>
              </div>

              {showSteps && (
                <div className="p-6 overflow-x-auto">
                  <div className="min-w-full">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                          <th className="py-4 px-6 text-left rounded-l-lg">i</th>
                          <th className="py-4 px-6 text-left">j</th>
                          <th className="py-4 px-6 text-left">λ<sub>j</sub> - λ<sub>i</sub></th>
                          <th className="py-4 px-6 text-left">v(x<sub>i</sub>, x<sub>j</sub>)</th>
                          <th className="py-4 px-6 text-left rounded-r-lg">λ<sub>j</sub> = λ<sub>i</sub> + v(x<sub>i</sub>, x<sub>j</sub>)</th>  
                        </tr>
                      </thead>
                      <tbody>
                        {calculationSteps
                          .slice(0, currentStepTable + 1)
                          .map((step, index) => (
                            <tr key={index} className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 transition-all duration-200">
                              <td className="py-4 px-6 font-medium text-slate-800">
                                {currentStepTable > index || currentColumn > 0 ? (
                                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">x{step.i}</span>
                                  </div>
                                ) : ''}
                              </td>
                              <td className="py-4 px-6 font-medium text-slate-800">
                                {currentStepTable > index || currentColumn > 1 ? (
                                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">x{step.j}</span>
                                  </div>
                                ) : ''}
                              </td>
                              <td className="py-4 px-6 text-slate-600">
                                {currentStepTable > index || currentColumn > 2 ? (
                                  <div className="bg-slate-100 rounded-lg px-3 py-1 inline-block font-mono text-sm">
                                    {step.diffValue}
                                  </div>
                                ) : ''}
                              </td>
                              <td className="py-4 px-6 text-slate-600">
                                {currentStepTable > index || currentColumn > 3 ? (
                                  <div className="bg-amber-100 rounded-lg px-3 py-1 inline-block font-bold text-amber-800">
                                    {step.weight}
                                  </div>
                                ) : ''}
                              </td>
                              <td className="py-4 px-6 text-slate-600">
                                {currentStepTable > index || currentColumn > 4 ? (
                                  <div className="bg-emerald-100 rounded-lg px-3 py-1 inline-block font-mono text-sm text-emerald-800">
                                    {step.newValue}
                                  </div>
                                ) : ''}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Visualisation du graphe */}
        <div className="mb-8">
          <GraphVisualization
            vertices={vertexCount}
            edges={edges}
            path={pathResult}
            pathType={pathType}
            onEdgeUpdate={handleEdgeUpdate}
            onEdgeDelete={handleEdgeDelete}
          />
        </div>

        {/* Résultats */}
        {result && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-violet-50 to-purple-50 p-4">
              <h2 className="text-xl font-bold text-slate-800 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg flex items-center justify-center mr-3">
                  <TargetIcon />
                </div>
                Résultats du Calcul
              </h2>
            </div>
            <div className="p-6">
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200">
                <pre className="whitespace-pre-wrap text-slate-700 font-mono text-sm leading-relaxed">{result}</pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GraphInterface;