class Queue<T> extends Array<T> {
    /**
     * First element of queue is deleted and returned
     * @returns Returns the first element
     */
    pop() {
        if (this.length === 0) {
            return undefined;
        }
        return this.shift();
    }

    /**
     * If the queue is empty, it will return undefined.
     * @returns The front element in the queue.
     */
    front() {
        if (this.length === 0) {
            return undefined;
        }
        return this[0];
    }

    /**
     * @returns true if the queue is empty else false
     */
    empty() {
        return this.length === 0;
    }
}
