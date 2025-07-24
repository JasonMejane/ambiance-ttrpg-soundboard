// This file exports TypeScript types and interfaces used throughout the application.

export interface AudioFile {
	name: string;
	url: string; // Object URL for browser playback
	duration: number; // Duration in seconds
	isPlaying: boolean; // Indicates if the audio file is currently playing
}
