"use client";
import { AIAssistantPanel } from "@/components/feature/ai-assistant/AIAssistantPanel";

export default function AssistantPage() {
  return (
    <div className="flex-1 h-full">
      {/* AI Assistant */}
      <div className="h-full" aria-label="AI Assistant Panel">
        <AIAssistantPanel />
      </div>
    </div>
  );
}
