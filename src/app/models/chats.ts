import { Timestamp } from "firebase/firestore";
import { User } from "./models";



export interface Chat {
    id: string;
    lastMessage?: string;
    lastMessageDate?: Date & Timestamp;
    userIds: string[];
    users: User[];
    // Not stored, only for display
    chatPic?: string;
    chatName?: string;
    chatLastName?: string;
}

export interface Message {
    text: string;
    senderId: string;
    sentDate: Date & Timestamp;
}