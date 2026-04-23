import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, RotateCcw, Home } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-8 max-w-sm"
          >
            <div className="w-20 h-20 bg-rose-50 rounded-[2.5rem] flex items-center justify-center text-rose-500 border border-rose-100 shadow-xl shadow-rose-500/5">
              <ShieldAlert size={32} />
            </div>
            
            <div className="space-y-3">
              <h2 className="text-2xl font-black tracking-tighter text-zinc-900">System Interruption</h2>
              <p className="text-zinc-500 text-sm font-medium leading-relaxed">
                The studio vault encountered an unexpected anomaly while retrieving assets. 
              </p>
            </div>

            <div className="flex flex-col gap-3 w-full capitalize">
              <button 
                onClick={() => window.location.reload()}
                className="bg-black text-white h-14 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl shadow-black/20 active:scale-95 transition-all"
              >
                <RotateCcw size={16} /> Re-Establish Link
              </button>
              <button 
                onClick={() => window.location.href = '/'}
                className="text-zinc-400 hover:text-black h-12 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 transition-all"
              >
                <Home size={16} /> Return to Core
              </button>
            </div>
            
            <span className="text-[10px] font-mono text-zinc-300 mt-4">ERROR_NODE: {this.state.error?.name || 'GENERIC_ANOMALY'}</span>
          </motion.div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
