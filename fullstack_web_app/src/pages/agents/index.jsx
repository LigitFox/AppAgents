import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, CheckCircle, XCircle, Clock, Users, Search, BarChart3, Lightbulb, AlertCircle, Eye, Download, RefreshCw, AlertTriangle, Bookmark, Trash2 } from 'lucide-react';
import { agentService } from '../../services/agentService';
import { authService } from '../../services/authService';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';


const AgentWorkflow = () => {
  const [workflowState, setWorkflowState] = useState('idle'); // idle, running, completed, error
  const [currentStep, setCurrentStep] = useState(null);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [ideaBank, setIdeaBank] = useState([]);
  const navigate = useNavigate();

  const agents = [
    {
      id: 'marketDiscovery',
      name: 'Market Discovery Agent',
      icon: Search,
      description: 'Generates market categories, niches, and selects optimal target market',
      color: 'bg-blue-500'
    },
    {
      id: 'marketValidation',
      name: 'Market Validation Agent',
      icon: CheckCircle,
      description: 'Validates market viability and stability with trend analysis',
      color: 'bg-green-500'
    },
    {
      id: 'research',
      name: 'Research Agent',
      icon: Users,
      description: 'Scrapes Reddit for authentic user discussions and pain points',
      color: 'bg-purple-500'
    },
    {
      id: 'analysis',
      name: 'Analysis Agent',
      icon: BarChart3,
      description: 'Analyzes Reddit data to extract key pain points and insights',
      color: 'bg-orange-500'
    },
    {
      id: 'strategy',
      name: 'Strategy Agent',
      icon: Lightbulb,
      description: 'Generates business solutions and startup ideas based on findings',
      color: 'bg-pink-500'
    }
  ];

  const startWorkflow = async () => {
    setWorkflowState('running');
    setError(null);
    setResults(null);
    setCurrentStep(0);

    try {
      const workflowResults = await agentService.executeWorkflow(ideaBank);
      setResults(workflowResults);
      setWorkflowState('completed');
      setCurrentStep(null);
    } catch (err) {
      console.error('Workflow error:', err);
      setError(err);
      setWorkflowState('error');
      setCurrentStep(null);
    }
  };

  const regenerateWorkflow = async () => {
    setWorkflowState('running');
    setError(null);
    setResults(null);
    setCurrentStep(0);

    try {
      // Add the current result to the idea bank before regenerating
      if (results) {
        setIdeaBank(prev => [...prev, results]);
      }
      const workflowResults = await agentService.executeWorkflow(ideaBank);
      setResults(workflowResults);
      setWorkflowState('completed');
      setCurrentStep(null);
    } catch (err) {
      console.error('Regenerate workflow error:', err);
      setError(err);
      setWorkflowState('error');
      setCurrentStep(null);
    }
  };

  const resetWorkflow = () => {
    setWorkflowState('idle');
    setCurrentStep(null);
    setResults(null);
    setError(null);
    setSelectedAgent(null);
  };

  const saveIdea = (solution) => {
    if (!solution) return;

    const isAlreadySaved = ideaBank.some(idea => idea.savedSolution.name === solution.name);

    if (isAlreadySaved) {
      // Maybe show a notification to the user
      console.log("Idea already saved!");
      return;
    }

    // Find the full result that contains this solution
    const resultToSave = results;

    setIdeaBank(prev => [...prev, { ...resultToSave, savedSolution: solution }]);
  };

  const removeIdea = (solutionName) => {
    setIdeaBank(prev => prev.filter(idea => idea.savedSolution.name !== solutionName));
  };


  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const getStepStatus = (stepIndex) => {
    if (workflowState === 'running') {
      if (stepIndex < currentStep) return 'completed';
      if (stepIndex === currentStep) return 'running';
      return 'pending';
    }
    if (workflowState === 'completed') return 'completed';
    if (workflowState === 'error' && stepIndex <= currentStep) return 'error';
    return 'pending';
  };

  const exportResults = () => {
    if (!results) return;
    
    const dataStr = JSON.stringify(results, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `market-research-results-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const getErrorMessage = () => {
    if (!error) return null;
    
    if (error.isQuotaError) {
      return {
        title: 'API Quota Exceeded',
        message: 'The AI service has reached its usage limit. This usually resolves automatically within a few minutes.',
        suggestion: 'Please wait a moment and try again. Consider upgrading your API plan for higher limits.',
        type: 'quota'
      };
    }
    
    if (error.userMessage) {
      return {
        title: 'Workflow Error',
        message: error.userMessage,
        suggestion: 'Please try again. If the problem persists, contact support.',
        type: 'general'
      };
    }
    
    return {
      title: 'Unknown Error',
      message: error.message || 'An unexpected error occurred',
      suggestion: 'Please try again or contact support if the issue persists.',
      type: 'unknown'
    };
  };

  const errorInfo = getErrorMessage();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Market Research Agents</h1>
          <p className="text-gray-600">Automated market discovery and validation workflow</p>
        </div>

        {/* Control Panel */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                onClick={startWorkflow}
                disabled={workflowState === 'running'}
                className="flex items-center space-x-2"
              >
                {workflowState === 'running' ? (
                  <>
                    <Pause className="h-4 w-4" />
                    <span>Running...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    <span>Start Workflow</span>
                  </>
                )}
              </Button>
              
              {workflowState === 'completed' && (
                <Button
                  onClick={regenerateWorkflow}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Regenerate</span>
                </Button>
              )}
              
              <Button
                onClick={resetWorkflow}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Reset</span>
              </Button>

              {results && (
                <Button
                  onClick={exportResults}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Export Results</span>
                </Button>
              )}

            </div>

            <div className="flex items-center space-x-4">
              <Button
                onClick={handleLogout}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <span>Logout</span>
              </Button>
              <div className="flex items-center space-x-2">
                <div className={`h-3 w-3 rounded-full ${
                  workflowState === 'running' ? 'bg-yellow-500 animate-pulse' :
                  workflowState === 'completed' ? 'bg-green-500' :
                  workflowState === 'error' ? 'bg-red-500' : 'bg-gray-300'
                }`} />
                <span className="text-sm text-gray-600 capitalize">{workflowState}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Agent Pipeline */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">Agent Pipeline</h2>
          
          <div className="space-y-4">
            {agents.map((agent, index) => {
              const status = getStepStatus(index);
              const IconComponent = agent.icon;
              
              return (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative flex items-center p-4 rounded-lg border-2 transition-all cursor-pointer ${
                    status === 'completed' ? 'border-green-200 bg-green-50' :
                    status === 'running' ? 'border-yellow-200 bg-yellow-50' :
                    status === 'error'? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'
                  }`}
                  onClick={() => setSelectedAgent(selectedAgent === agent.id ? null : agent.id)}
                >
                  <div className={`flex-shrink-0 w-12 h-12 rounded-lg ${agent.color} flex items-center justify-center text-white mr-4`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                    <p className="text-sm text-gray-600">{agent.description}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {status === 'completed' && <CheckCircle className="h-5 w-5 text-green-500" />}
                    {status === 'running' && <Clock className="h-5 w-5 text-yellow-500 animate-spin" />}
                    {status === 'error' && <XCircle className="h-5 w-5 text-red-500" />}
                    {status === 'pending' && <div className="h-5 w-5 rounded-full bg-gray-300" />}
                  </div>
                  
                  {index < agents.length - 1 && (
                    <div className="absolute left-6 top-full w-0.5 h-4 bg-gray-300" />
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Enhanced Error Display */}
        {error && errorInfo && (
          <div className={`rounded-lg p-6 mb-8 border-l-4 ${
            errorInfo.type === 'quota' ? 'bg-amber-50 border-amber-400' :
            errorInfo.type === 'general'? 'bg-red-50 border-red-400' : 'bg-gray-50 border-gray-400'
          }`}>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                {errorInfo.type === 'quota' ? (
                  <AlertTriangle className="h-6 w-6 text-amber-500" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-red-500" />
                )}
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold text-lg mb-2 ${
                  errorInfo.type === 'quota' ? 'text-amber-800' :
                  errorInfo.type === 'general'? 'text-red-800' : 'text-gray-800'
                }`}>
                  {errorInfo.title}
                </h3>
                <p className={`mb-3 ${
                  errorInfo.type === 'quota' ? 'text-amber-700' :
                  errorInfo.type === 'general'? 'text-red-700' : 'text-gray-700'
                }`}>
                  {errorInfo.message}
                </p>
                <p className={`text-sm ${
                  errorInfo.type === 'quota' ? 'text-amber-600' :
                  errorInfo.type === 'general'? 'text-red-600' : 'text-gray-600'
                }`}>
                  <strong>Suggestion:</strong> {errorInfo.suggestion}
                </p>
                
                {errorInfo.type === 'quota' && (
                  <div className="mt-4 p-3 bg-amber-100 rounded-lg">
                    <h4 className="font-medium text-amber-800 mb-2">What you can do:</h4>
                    <ul className="text-sm text-amber-700 space-y-1">
                      <li>• Wait 5-10 minutes and try again</li>
                      <li>• The system will automatically retry with fallback options</li>
                      <li>• Check your API quota and billing settings</li>
                      <li>• Consider upgrading your plan for higher limits</li>
                    </ul>
                  </div>
                )}
                
                {error.attempts && (
                  <div className="mt-3 text-sm text-gray-600">
                    <span>Attempts made: {error.attempts}</span>
                    {retryCount > 0 && <span className="ml-4">Retries: {retryCount}</span>}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Results Display */}
        {results && (
          <div className="space-y-6">
            {/* Workflow Status */}
            {results.errors && results.errors.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <h3 className="font-semibold text-yellow-800">Workflow Completed with Warnings</h3>
                </div>
                <p className="text-yellow-700 mb-2">Some agents used fallback methods due to API limitations:</p>
                <ul className="text-sm text-yellow-600 space-y-1">
                  {results.errors.map((error, index) => (
                    <li key={index}>• {error.agent}: {error.userMessage}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Market Discovery Results */}
            {results.marketDiscovery && (
              <ResultCard
                title="Market Discovery Results"
                icon={Search}
                color="bg-blue-500"
                data={results.marketDiscovery}
                isFallback={results.marketDiscovery.isFallback}
                renderContent={() => (
                  <div className="space-y-4">
                    {results.marketDiscovery.isFallback && (
                      <div className="bg-blue-100 rounded-lg p-3 mb-4">
                        <p className="text-blue-800 text-sm">
                          <AlertTriangle className="h-4 w-4 inline mr-1" />
                          Fallback data used due to API limitations
                        </p>
                      </div>
                    )}
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 mb-2">Chosen Market</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm text-blue-700">Category:</span>
                          <p className="font-medium">{results.marketDiscovery.chosenMarket?.category}</p>
                        </div>
                        <div>
                          <span className="text-sm text-blue-700">Subcategory:</span>
                          <p className="font-medium">{results.marketDiscovery.chosenMarket?.subcategory}</p>
                        </div>
                        <div>
                          <span className="text-sm text-blue-700">Niche:</span>
                          <p className="font-medium">{results.marketDiscovery.chosenMarket?.niche}</p>
                        </div>
                        <div>
                          <span className="text-sm text-blue-700">Sub-niche:</span>
                          <p className="font-medium">{results.marketDiscovery.chosenMarket?.subNiche}</p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <span className="text-sm text-blue-700">Reasoning:</span>
                        <p className="text-gray-700">{results.marketDiscovery.chosenMarket?.reasoning}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Generated Categories ({results.marketDiscovery.categories?.length || 0})</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {results.marketDiscovery.categories?.map((category, index) => (
                          <div key={index} className="border rounded-lg p-3">
                            <h5 className="font-medium text-gray-900">{category.main}</h5>
                            <p className="text-sm text-gray-600">{category.subcategories?.length || 0} subcategories</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              />
            )}

            {/* Market Validation Results */}
            {results.marketValidation && (
              <ResultCard
                title="Market Validation Results"
                icon={CheckCircle}
                color="bg-green-500"
                data={results.marketValidation}
                renderContent={() => (
                  <div className="space-y-4">
                    <div className={`rounded-lg p-4 ${results.marketValidation.isValid ? 'bg-green-50' : 'bg-red-50'}`}>
                      <div className="flex items-center space-x-2 mb-2">
                        {results.marketValidation.isValid ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                        <h4 className={`font-semibold ${results.marketValidation.isValid ? 'text-green-900' : 'text-red-900'}`}>
                          {results.marketValidation.isValid ? 'Market Validated' : 'Market Rejected'}
                        </h4>
                        <span className="text-sm font-medium bg-gray-100 px-2 py-1 rounded">
                          {results.marketValidation.confidence}
                        </span>
                      </div>
                      
                      {results.marketValidation.analysis && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <div>
                            <span className="text-sm text-gray-700">Demand:</span>
                            <p className="text-sm">{results.marketValidation.analysis.demand}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-700">Competition:</span>
                            <p className="text-sm">{results.marketValidation.analysis.competition}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-700">Stability:</span>
                            <p className="text-sm">{results.marketValidation.analysis.stability}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-700">Growth:</span>
                            <p className="text-sm">{results.marketValidation.analysis.growth}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              />
            )}

            {/* Research Results */}
            {results.research && (
              <ResultCard
                title="Research Results"
                icon={Users}
                color="bg-purple-500"
                data={results.research}
                renderContent={() => (
                  <div className="space-y-4">
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-900 mb-2">Reddit Search Summary</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm text-purple-700">Search Query:</span>
                          <p className="font-medium">{results.research.query}</p>
                        </div>
                        <div>
                          <span className="text-sm text-purple-700">Threads Found:</span>
                          <p className="font-medium">{results.research.totalThreads}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Top Threads</h4>
                      <div className="space-y-3">
                        {results.research.threads?.slice(0, 3).map((thread, index) => (
                          <div key={index} className="border rounded-lg p-3">
                            <h5 className="font-medium text-gray-900 mb-1">{thread.title}</h5>
                            <p className="text-sm text-gray-600 mb-2">{thread.selftext?.substring(0, 150)}...</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span>Score: {thread.score}</span>
                              <span>Comments: {thread.num_comments}</span>
                              <span>r/{thread.subreddit}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              />
            )}

            {/* Analysis Results */}
            {results.analysis && (
              <ResultCard
                title="Analysis Results"
                icon={BarChart3}
                color="bg-orange-500"
                data={results.analysis}
                isFallback={results.analysis.isFallback}
                renderContent={() => (
                  <div className="space-y-4">
                    {results.analysis.isFallback && (
                      <div className="bg-orange-100 rounded-lg p-3 mb-4">
                        <p className="text-orange-800 text-sm">
                          <AlertTriangle className="h-4 w-4 inline mr-1" />
                          Simplified analysis used due to API limitations
                        </p>
                      </div>
                    )}
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h4 className="font-semibold text-orange-900 mb-2">Pain Points Summary</h4>
                      <p className="text-gray-700">{results.analysis.summary}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Key Pain Points ({results.analysis.painPoints?.length || 0})</h4>
                      <div className="space-y-3">
                        {results.analysis.painPoints?.map((painPoint, index) => (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium text-gray-900">{painPoint.title}</h5>
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 rounded text-xs ${
                                  painPoint.frequency === 'high' ? 'bg-red-100 text-red-800' :
                                  painPoint.frequency === 'medium'? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                                }`}>
                                  {painPoint.frequency} frequency
                                </span>
                                <span className={`px-2 py-1 rounded text-xs ${
                                  painPoint.intensity === 'high' ? 'bg-red-100 text-red-800' :
                                  painPoint.intensity === 'medium'? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                                }`}>
                                  {painPoint.intensity} intensity
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{painPoint.description}</p>
                            <div className="text-xs text-gray-500">
                              <span>Category: {painPoint.category}</span>
                              <span className="ml-4">Solvability: {painPoint.solvability}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              />
            )}

            {/* Strategy Results */}
            {results.strategy && (
              <ResultCard
                title="Strategy Results"
                icon={Lightbulb}
                color="bg-pink-500"
                data={results.strategy}
                isFallback={results.strategy.isFallback}
                renderContent={() => (
                  <div className="space-y-4">
                    {results.strategy.isFallback && (
                      <div className="bg-pink-100 rounded-lg p-3 mb-4">
                        <p className="text-pink-800 text-sm">
                          <AlertTriangle className="h-4 w-4 inline mr-1" />
                          Basic strategy generated due to API limitations
                        </p>
                      </div>
                    )}
                    <div className="bg-pink-50 rounded-lg p-4">
                      <h4 className="font-semibold text-pink-900 mb-2">Executive Summary</h4>
                      <p className="text-gray-700">{results.strategy.executiveSummary}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Business Solutions ({results.strategy.solutions?.length || 0})</h4>
                      <div className="space-y-4">
                        {results.strategy.solutions?.map((solution, index) => (
                          <div key={index} className="border rounded-lg p-4 relative">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium text-gray-900">{solution.name}</h5>
                              <span className="text-xs bg-gray-100 px-2 py-1 rounded">{solution.framework}</span>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{solution.description}</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <span className="text-sm font-medium text-gray-700">Value Proposition:</span>
                                <p className="text-sm">{solution.valueProposition}</p>
                              </div>
                              <div>
                                <span className="text-sm font-medium text-gray-700">Business Model:</span>
                                <p className="text-sm">{solution.businessModel}</p>
                              </div>
                            </div>
                            
                            <div className="mt-3">
                              <span className="text-sm font-medium text-gray-700">Key Features:</span>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {solution.keyFeatures?.map((feature, featureIndex) => (
                                  <span key={featureIndex} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                    {feature}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <Button
                              onClick={() => saveIdea(solution)}
                              variant="outline"
                              className="absolute bottom-4 right-4 flex items-center space-x-2"
                            >
                              <Bookmark className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {results.strategy.topRecommendations && (
                      <div>
                        <h4 className="font-semibold mb-2">Top Recommendations</h4>
                        <div className="space-y-3">
                          {results.strategy.topRecommendations.map((rec, index) => (
                            <div key={index} className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4">
                              <h5 className="font-medium text-gray-900 mb-2">{rec.solution}</h5>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-600">Market Size:</span>
                                  <p>{rec.marketSize}</p>
                                </div>
                                <div>
                                  <span className="text-gray-600">Feasibility:</span>
                                  <p>{rec.feasibility}</p>
                                </div>
                                <div>
                                  <span className="text-gray-600">Competitive Advantage:</span>
                                  <p>{rec.competitiveAdvantage}</p>
                                </div>
                                <div>
                                  <span className="text-gray-600">Dominance Potential:</span>
                                  <p>{rec.dominancePotential}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              />
            )}
          </div>
        )}

        {/* Idea Bank */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">Idea Bank</h2>
            {ideaBank.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ideaBank.map((idea, index) => {
                  const solution = idea.savedSolution;
                  if (!solution) return null;

                  return (
                    <div key={index} className="bg-gray-50 rounded-lg p-4 border relative">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-lg">{solution.name}</h3>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">{solution.framework}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{solution.description}</p>
                      
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <span className="text-sm font-medium text-gray-700">Value Proposition:</span>
                          <p className="text-sm">{solution.valueProposition}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700">Business Model:</span>
                          <p className="text-sm">{solution.businessModel}</p>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <span className="text-sm font-medium text-gray-700">Key Features:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {solution.keyFeatures?.map((feature, featureIndex) => (
                            <span key={featureIndex} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                      <Button
                        onClick={() => removeIdea(solution.name)}
                        variant="ghost"
                        size="icon"
                        className="absolute bottom-2 right-2 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">Your idea bank is empty.</p>
                <p className="text-sm text-gray-400">Save ideas to see them here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ResultCard = ({ title, icon: Icon, color, data, isFallback, renderContent }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center text-white`}>
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{title}</h3>
            {isFallback && (
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                Fallback Data
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            {data ? 'Data available' : 'No data'}
          </span>
          <Eye className={`h-4 w-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </div>
      
      {isExpanded && data && (
        <div className="border-t p-4">
          {renderContent()}
        </div>
      )}
    </div>
  );
};

export default AgentWorkflow;