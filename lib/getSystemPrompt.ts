import { SYSTEM_PROMPT } from "@/prompts/systemPrompt"
import { CHAT_PROMPT } from "@/prompts/chatPrompt";

export function getSystemPrompt(type: string) {
    switch (type) {
        case "chat" :
            return CHAT_PROMPT;

        default :
            return SYSTEM_PROMPT;
    }
}