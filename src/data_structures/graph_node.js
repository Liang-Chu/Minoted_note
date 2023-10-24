class GraphNode {
    #contents;
    #parents;
    #children;

    constructor(contents) {
        this.#contents = contents;
        this.#parents = []; // List of parent nodes
        this.#children = []; // List of child nodes
    }

    // Add a parent node
    addParent(parentNode) {
        this.#parents.push(parentNode);
    }

    // Add a child node
    addChild(childNode) {
        this.#children.push(childNode);
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
