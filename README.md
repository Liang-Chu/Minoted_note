# Minoted

## Author

- **Name**: Liam Chu
- **Contact**: [liamchu@protonmail.com](mailto:liamchu@protonmail.com)

## Description

Minoted, blending "mind", "note" and "minimalist", revolutionizes markdown note management by breaking the "one parent per sub-object" norm. It forms a true interconnected note map, offering flexibility beyond traditional tree-structured mind maps.

By sing markdown with minimal extra syntax, Minoted ensures ease of use and accessibility to advanced features.

In the near future, Minoted will integrate AI to convert graphs or handwritten notes into markdown files and leverage OpenAI for automatic completion, summarization, and refinement of draft notes, redefining note-taking efficiency.
## Tech Stack

### Frontend

- **React (v18.2.0)**: For UI development.
- **Tailwind CSS (v3.0.7)**: For rapid UI development.
- **React Router DOM (v6.17.0)**: Navigational components.
- **React Markdown (v9.0.0)**: Renders Markdown as React elements.

### Backend

- **Node.js (v16.13.1)**: Non-blocking, event-driven architecture.
- **NeDB (v1.8.0)**: JavaScript database.

### Desktop Application Framework

- **Electron (v27.0.0)**: Native application development.

### Development Tools

- **Webpack (v5.89.0)**: Bundles applications.
- **Babel (v7.23.2)**: Transpiles for better browser compatibility.
- **Cross-env (v7.0.3)**: Sets environment variables.

### Artificial Intelligence Tools (Not Implemented Yet)

- **OpenAI**: For automatic completion, summarization, and refinement of draft notes.
- **TensorFlow Lite**: For recognizing pictures of handwritten notes or graphs.

## System Requirements

The following specifications are recommended for optimal performance of Minoted:

### Hardware:

- Processor: Minimum 1 GHz
- RAM: 512 MB minimum (1 GB recommended)
- Storage: 100 MB free space

### Software:

- Operating System: Windows 7+, will be available on other platforms in the future.
- Node.js: Compatible with the development environment (specific version not specified)
- Electron: Version 27.0.0
- React: Version 18.2.0
- NeDB: Version 1.8.0

Note: System performance may vary based on hardware and operating system specifications. Up-to-date system drivers, particularly graphics drivers, are recommended.

## Build

To build the Minoted project, follow these steps:

1. **Clone the Repository**
   - Clone the repository to your local machine using:
     ```
     git clone https://github.com/Liang-Chu/Minoted_note.git
     ```
   - Navigate to the project directory:
     ```
     cd Minoted_note
     ```

2. **Install Dependencies**
   - Make sure you have Node.js installed on your system.
   - Install the project dependencies by running:
     ```
     npm install
     ```

3. **Build the Application**
   - To build the application for production, run:
     ```
     npm run build
     ```
   - This command uses Webpack to bundle the JavaScript application.

4. **Start the Application**
   - After the build is complete, you can start the application by running:
     ```
     npm start
     ```
   - This will launch the Electron application.

Note: These instructions assume you have Git and Node.js already installed on your system. For development purposes, you can use `npm run dev` to build the application in development mode with watch enabled.

## Highlights

- **Efficient Note Management**: Enables flexible note access, eliminating time-consuming folder navigation.
- **Unique Visualization**: Generates a true mind "map", not just a "tree".
- **Easy to Learn**: Uses markdown syntax with minimal extras for quick mastery.
- **Minimalist Design**: Strips unnecessary features for performance and simplicity.



## License

Minoted is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
