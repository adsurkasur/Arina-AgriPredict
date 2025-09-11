import { ForecastResponse } from '@/types/api';

export interface ExportCapabilitiesProps {
  forecastData: ForecastResponse;
  productName?: string;
}

export interface ExportFormat {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
}

export interface ExportOptions {
  includeCharts: boolean;
  includeSummary: boolean;
  includeConfidence: boolean;
}

export interface ExportState {
  exportFormat: string;
  options: ExportOptions;
  isExporting: boolean;
}

export interface ExportHandlers {
  onFormatChange: (_format: string) => void;
  onOptionsChange: (_options: Partial<ExportOptions>) => void;
  onExport: () => Promise<void>;
  onShare: () => void;
  onEmail: () => void;
}

export interface FormatSelectorProps {
  formats: ExportFormat[];
  selectedFormat: string;
  onFormatChange: (_format: string) => void;
}

export interface ExportOptionsProps {
  options: ExportOptions;
  onOptionsChange: (_options: Partial<ExportOptions>) => void;
}

export interface ExportButtonProps {
  format: string;
  formats: ExportFormat[];
  isExporting: boolean;
  onExport: () => Promise<void>;
}

export interface QuickActionsProps {
  onShare: () => void;
  onEmail: () => void;
}

export interface DataPreviewProps {
  forecastData: ForecastResponse;
  includeConfidence: boolean;
}

export interface ExportHistoryProps {
  // Future: could include actual history data
}
