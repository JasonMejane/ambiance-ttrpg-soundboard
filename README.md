# TTRPG Ambiance - The TTRPG soundboard app

This is a lightweight Vue application that allows users to play music from any local folder. The app provides a user-friendly interface to browse and select audio files for playback.

## Project Structure

```
├── src
│   ├── App.vue                # Root component of the Vue application
│   ├── assets
│   │   └── styles
│   │       └── main.css       # Main styles for the application
│   ├── components
│   │   ├── AudioPlayer.vue     # Component for audio playback functionality
│   │   └── FileList.vue        # Component to display a list of audio files
│   ├── main.ts                 # Entry point of the application
│   └── types
│       └── index.ts            # TypeScript types and interfaces
├── index.html                  # Main HTML file for the Vue application
├── package.json                # npm configuration file
├── tsconfig.json               # TypeScript configuration file
├── vite.config.ts              # Vite configuration file
└── README.md                   # Documentation for the project
```

## Setup Instructions

1. Clone the repository:

    ```
    git clone <repository-url>
    ```

2. Install the dependencies:

    ```
    npm install
    ```

3. Run the development server:

    ```
    npm run dev
    ```

4. Open your browser and go to `http://localhost:3000` to view the app.

## Usage

-   Use the `FileList` component to browse and select audio files from your local folder.
-   The `AudioPlayer` component will handle playback of the selected audio files.

## License

This project is licensed under the MIT License.
