"use client";
import { useContext } from 'react';
import { LoadingContext } from '../components/providers/LoadingProvider';

export function useGlobalLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useGlobalLoading must be used within a LoadingProvider');
  }
  return context;
}
