import {ChatPanel} from '../../../src/widgets/chat/ui/ChatPanel';

export default async function ChatPage({params}: {params: Promise<{chatId: string}>}) {
    const {chatId} = await params;
    return <ChatPanel chatId={chatId} />;
}
