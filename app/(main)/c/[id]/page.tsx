import ChatContainer from "@/components/chat/ChatContainer";
import ChatAuthGuard from "@/components/chat/ChatAuthGuard";

export default function Page() {
  return (
    <ChatAuthGuard>
      <ChatContainer />
    </ChatAuthGuard>
  );
}