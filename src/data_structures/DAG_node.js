class DAG_node {
    #contents;
    #depth;
    #parents;
    #children;

    constructor(contents) {
        this.#contents = contents;
        this.#depth = 0; // Default depth
        this.#parents = []; // List of parent nodes
        this.#children = []; // List of child nodes
    }

    // Add a parent node
    addParent(parentNode) {
        if (parentNode.getDepth() < this.#depth) {
            this.#parents.push(parentNode);
        } else {
            throw new Error("Parent node must be at a lower depth.");
        }
    }

    // Add a child node
    addChild(childNode) {
        if (childNode.getDepth() > this.#depth) {
            this.#children.push(childNode);
        } else {
            throw new Error("Child node must be at a higher depth.");
        }
    }

    // Set depth
    setDepth(depth) {
        this.#depth = depth;
    }

    // Get depth
    getDepth() {
        return this.#depth;
    }

    // Get contents
    getContents() {
        return this.#contents;
    }

    // Set contents
    setContents(contents) {
        this.#contents = contents;
    }

    // Get parents
    getParents() {
        return [...this.#parents]; // Return a copy to prevent direct manipulation
    }

    // Get children
    getChildren() {
        return [...this.#children]; // Return a copy to prevent direct manipulation
    }
}
