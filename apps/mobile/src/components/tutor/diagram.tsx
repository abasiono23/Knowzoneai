import { AiDiagram } from '@/components/content/ai-diagram';
import { useTutor } from '@/lib/tutor/store';

/** A diagram of a tutor answer, drawn by AI on request (1 AI credit). */
export function AnswerDiagram({
  conversationId,
  messageId,
  image,
}: {
  conversationId: string;
  messageId: string;
  image?: string;
}) {
  const tutor = useTutor();
  return <AiDiagram image={image} canDraw={tutor.canDraw} onDraw={() => tutor.drawDiagram(conversationId, messageId)} />;
}
