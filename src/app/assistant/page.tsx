"use client";
import { AIAssistantPanel } from "@/components/feature/ai-assistant/AIAssistantPanel";

export default function AssistantPage() {
  return (
    <div className="flex-1 p-6">
      <div className="max-w-4xl mx-auto">
        {/* AI Assistant */}
        <div aria-label="AI Assistant Panel">
          <AIAssistantPanel />
        </div>
      </div>
    </div>
  );
}
