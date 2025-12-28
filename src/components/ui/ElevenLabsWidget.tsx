import { useEffect } from "react";

interface ElevenLabsWidgetProps {
  agentId: string;
}

export const ElevenLabsWidget = ({ agentId }: ElevenLabsWidgetProps) => {
  useEffect(() => {
    // Load the ElevenLabs ConvAI widget script
    const script = document.createElement("script");
    script.src = "https://unpkg.com/@elevenlabs/convai-widget-embed@beta";
    script.async = true;
    script.type = "text/javascript";
    document.body.appendChild(script);

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector(
        `script[src="${script.src}"]`
      );
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  return (
    <div
      dangerouslySetInnerHTML={{
        __html: `<elevenlabs-convai agent-id="${agentId}"></elevenlabs-convai>`,
      }}
    />
  );
};
