import { IMsg } from "../types/IMessage";

class TypingNode {
    public value: IMsg | null;
    public next: TypingNode | null;

    constructor (obj: IMsg) {
        this.value = obj;
        this.next = null;
    }
}

abstract class TypingList {
    public typingHead: TypingNode | null;
    public typingTail: TypingNode | null;

    constructor () {
        this.typingHead = null;
        this.typingTail = null;
    }

    allTypingMessages(): IMsg[] {
        let head = this.typingHead;
        const list: IMsg[] = [];

        while (head) {
            list.push(head.value as IMsg);

            head = head.next;
        }

        return list;
    }

    protected isUserTypingMsgExist(userId: string): boolean {
        let current = this.typingHead;

        while (current) {
            if (current.value?.userId === userId) {
                return true;
            }

            current = current.next;
        }

        return false;
    }

    removeSpecificTypingList(chatId: string ): boolean {
        let res = false;
        
        while (this.typingHead?.value?.chatId === chatId) {
            res = true;
            const next = this.typingHead.next;

            if (next) {
                this.typingHead = next;
            } else {
                this.typingHead = null;
                this.typingTail = this.typingHead;
            }
        }

        let current = this.typingHead;

        while (current) {
            if (current.next !== null && current.next.value?.chatId === chatId) {
                res = true;
                const next = current.next.next;

                if (next) {
                    current.next = next;
                } else {
                    current.next = null;
                    this.typingTail = current;
                }
            } else {
                current = current.next;
            }
        }

        return res;
    }

    removeTypingList(userId: string): boolean {
        let res = false;
        let current = this.typingHead;

        if (current?.value?.userId === userId) {
            res = true;
            const next = current.next;

            if (next !== null) {
                this.typingHead = next;
            } else {
                this.typingHead = null;
                this.typingTail = null;
            }
        }

        while (current) {
            if (current.next?.value?.userId === userId) {
                res = true;
                const next = current.next.next;

                if (next !== null) {
                    current.next = next;
                } else {
                    current.next = null;
                    this.typingTail = current;
                }
            }

            current = current.next;
        }

        return res;
    }

    pushTypingList(obj: IMsg): TypingNode | null {
        const newNode = new TypingNode(obj);

        if (this.isUserTypingMsgExist(obj.userId)) {
            return null;
        }

        if (!this.typingHead) {
            this.typingHead = newNode;
            this.typingTail = newNode;
        } else {
            if (!this.typingTail) return null;

            this.typingTail.next = newNode;
            this.typingTail = newNode;
        }

        return newNode;
    }
}

export default TypingList;
