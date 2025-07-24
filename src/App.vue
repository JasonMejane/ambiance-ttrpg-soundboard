<template>
	<div id="app" class="ambiance-app">
		<aside class="ambiance-sidebar">
			<div class="sidebar-header">
				<span class="ambiance-logo">🎵</span>
				<div>
					<span class="ambiance-title">Ambiance</span>
					<br />
					<span class="ambiance-subtitle">TTRPG Soundboard</span>
				</div>
			</div>
			<nav class="sidebar-nav">
				<div class="sidebar-section">Playlists</div>
				<PlaylistManager
					:playlists="playlists"
					:selectedPlaylistIndex="selectedPlaylistIndex"
					:selectedPlaylist="selectedPlaylist"
					:audioFiles="audioFiles"
					@create-playlist="createPlaylist"
					@select-playlist="selectPlaylist"
					@delete-playlist="deletePlaylist"
					@add-file-to-playlist="addFileToPlaylist"
					@remove-file-from-playlist="removeFileFromPlaylist"
					@move-file-in-playlist="moveFileInPlaylist"
				/>
				<div v-if="selectedPlaylist && selectedPlaylist.audioFiles.length" class="playlist-controls p-mt-3">
					<Button label="Load Playlist" icon="pi pi-download" class="p-button-sm p-button-outlined" @click="loadPlaylist" />
				</div>
			</nav>
		</aside>
		<main class="ambiance-main">
			<div class="ambiance-card">
				<h2 class="ambiance-section-title">Audio Files</h2>
				<FileList
					:audioFiles="audioFiles"
					@file-selected="onFileSelect"
					@file-list-updated="onFileListUpdated"
					:selectedIndex="selectedIndex"
					:playingIndex="selectedIndex"
					:playbackState="playbackState"
					@update:selectedIndex="onSelectedIndexUpdate"
				/>
			</div>
		</main>
		<div class="ambiance-player-bar">
			<AudioPlayer
				ref="audioPlayerRef"
				:key="selectedFile?.url || ''"
				:currentAudio="selectedFile?.url || ''"
				:playbackState="playbackState"
				:loop="loop"
				:audioFiles="audioFiles"
				:selectedIndex="selectedIndex"
				@ended="onAudioEnded"
				@play="onPlay"
				@pause="onPause"
				@stop="onStop"
				@previous="playPrevious"
				@next="playNext"
				@toggle-loop="toggleLoop"
			/>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, nextTick } from "vue";
import FileList from "./components/FileList.vue";
import AudioPlayer from "./components/AudioPlayer.vue";
import PlaylistManager from "./components/PlaylistManager.vue";
import type { AudioFile, Playlist } from "./types";

export default defineComponent({
	components: {
		FileList,
		AudioPlayer,
		PlaylistManager,
	},
	setup() {
		const selectedFile = ref<AudioFile | null>(null);
		const selectedIndex = ref<number>(-1);
		const audioFiles = ref<AudioFile[]>([]);
		const playbackState = ref<"playing" | "paused" | "stopped">("stopped");
		const audioPlayerRef = ref<any>(null);

		// Playlist management
		const playlists = ref<Playlist[]>([]);
		const selectedPlaylistIndex = ref<number>(-1);
		const selectedPlaylist = computed(() => (selectedPlaylistIndex.value >= 0 ? playlists.value[selectedPlaylistIndex.value] : null));

		const loadPlaylist = () => {
			if (!selectedPlaylist.value) return;
			audioFiles.value = selectedPlaylist.value.audioFiles.slice();
			selectedIndex.value = audioFiles.value.length > 0 ? 0 : -1;
			selectedFile.value = audioFiles.value.length > 0 ? audioFiles.value[0] : null;
			playbackState.value = "stopped";
		};

		const createPlaylist = (name: string) => {
			if (!name.trim()) return;
			playlists.value.push({ name, audioFiles: [] });
		};

		const selectPlaylist = (idx: number) => {
			selectedPlaylistIndex.value = idx;
		};

		const deletePlaylist = (idx: number) => {
			playlists.value.splice(idx, 1);
			if (selectedPlaylistIndex.value === idx) {
				selectedPlaylistIndex.value = -1;
			}
		};

		const addFileToPlaylist = (fileUrl: string) => {
			const playlist = selectedPlaylist.value;
			if (!playlist) return;
			const file = audioFiles.value.find((f) => f.url === fileUrl);
			if (file && !playlist.audioFiles.some((f) => f.url === file.url)) {
				playlist.audioFiles.push(file);
			}
		};

		const removeFileFromPlaylist = (fileIdx: number) => {
			const playlist = selectedPlaylist.value;
			if (!playlist) return;
			playlist.audioFiles.splice(fileIdx, 1);
		};

		const moveFileInPlaylist = ({ fileIdx, direction }: { fileIdx: number; direction: "up" | "down" }) => {
			const playlist = selectedPlaylist.value;
			if (!playlist) return;
			const files = playlist.audioFiles;
			if (direction === "up" && fileIdx > 0) {
				[files[fileIdx - 1], files[fileIdx]] = [files[fileIdx], files[fileIdx - 1]];
			} else if (direction === "down" && fileIdx < files.length - 1) {
				[files[fileIdx + 1], files[fileIdx]] = [files[fileIdx], files[fileIdx + 1]];
			}
		};

		const onFileSelect = async (file: AudioFile) => {
			selectedFile.value = file;
			playbackState.value = "stopped";
			await nextTick();
			if (audioPlayerRef.value && audioPlayerRef.value.onPlay) {
				audioPlayerRef.value.onPlay();
			}
		};

		const onFileListUpdated = (files: AudioFile[]) => {
			audioFiles.value = files;
			selectedIndex.value = files.length > 0 ? 0 : -1;
			selectedFile.value = files.length > 0 ? files[0] : null;
			playbackState.value = "stopped";
		};

		const onSelectedIndexUpdate = (idx: number) => {
			selectedIndex.value = idx;
			selectedFile.value = audioFiles.value[idx] || null;
			playbackState.value = "stopped";
		};

		// AudioPlayer event handlers
		const onPlay = () => {
			playbackState.value = "playing";
		};
		const onPause = () => {
			playbackState.value = "paused";
		};
		const onStop = () => {
			playbackState.value = "stopped";
		};
		// No playlist playback logic needed
		const onAudioEnded = () => {
			playbackState.value = "stopped";
			if (loop.value) {
				selectedIndex.value = 0;
				selectedFile.value = audioFiles.value[0];
				playbackState.value = "playing";
				if (audioPlayerRef.value && audioPlayerRef.value.onPlay) {
					audioPlayerRef.value.onPlay();
				}
			} else {
				playNext();
			}
		};

		const loop = ref(false);

		const toggleLoop = () => {
			loop.value = !loop.value;
		};

		const playPrevious = async () => {
			if (audioFiles.value.length === 0) return;
			if (selectedIndex.value > 0) {
				selectedIndex.value--;
			} else if (loop.value && audioFiles.value.length > 0) {
				selectedIndex.value = audioFiles.value.length - 1;
			} else {
				return;
			}
			selectedFile.value = audioFiles.value[selectedIndex.value];
			playbackState.value = "stopped";
			await nextTick();
			if (audioPlayerRef.value && audioPlayerRef.value.onPlay) {
				audioPlayerRef.value.onPlay();
			}
		};

		const playNext = async () => {
			if (audioFiles.value.length === 0) return;
			if (selectedIndex.value < audioFiles.value.length - 1) {
				selectedIndex.value++;
			} else if (loop.value && audioFiles.value.length > 0) {
				selectedIndex.value = 0;
			} else {
				return;
			}
			selectedFile.value = audioFiles.value[selectedIndex.value];
			playbackState.value = "stopped";
			await nextTick();
			if (audioPlayerRef.value && audioPlayerRef.value.onPlay) {
				audioPlayerRef.value.onPlay();
			}
		};

		return {
			selectedFile,
			selectedIndex,
			audioFiles,
			onFileSelect,
			onFileListUpdated,
			onSelectedIndexUpdate,
			playlists,
			selectedPlaylistIndex,
			selectedPlaylist,
			createPlaylist,
			selectPlaylist,
			deletePlaylist,
			addFileToPlaylist,
			removeFileFromPlaylist,
			loadPlaylist,
			moveFileInPlaylist,
			onAudioEnded,
			playbackState,
			onPlay,
			onPause,
			onStop,
			audioPlayerRef,
			playPrevious,
			playNext,
			loop,
			toggleLoop,
		};
	},
});
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap");

.ambiance-app {
	min-height: 100vh;
	display: flex;
	flex-direction: row;
	font-family: "Inter", system-ui, Arial, sans-serif;
	background: #191414;
	color: #fff;
}
.ambiance-sidebar {
	width: 300px;
	min-width: 220px;
	max-width: 340px;
	background: #121212;
	padding: 2rem 1.5rem 1.5rem 1.5rem;
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	border-right: 1px solid #232323;
	height: 100vh;
	position: sticky;
	top: 0;
}
.sidebar-header {
	display: flex;
	align-items: center;
	font-size: 1.5em;
	font-weight: 600;
	margin-bottom: 2.5rem;
	color: #1db954;
}
.ambiance-logo {
	font-size: 2em;
	margin-right: 0.5em;
}
.ambiance-title {
	font-size: 1.2em;
	letter-spacing: 1px;
	text-align: center;
}
.ambiance-subtitle {
	font-size: 0.5em;
	letter-spacing: 1px;
	text-align: center;
}
.sidebar-nav {
	width: 100%;
}
.sidebar-section {
	font-size: 1.1em;
	font-weight: 600;
	margin-bottom: 1em;
	color: #b3b3b3;
	letter-spacing: 1px;
}
.ambiance-main {
	flex: 1;
	min-width: 0;
	padding: 2.5rem 2rem 6rem 2rem;
	background: #191414;
	display: flex;
	flex-direction: column;
	align-items: flex-start;
}
.ambiance-card {
	background: #232323;
	border-radius: 18px;
	box-shadow: 0 2px 16px 0 rgba(0, 0, 0, 0.12);
	padding: 2rem 2rem 1.5rem 2rem;
	width: 100%;
	max-width: 900px;
	margin-bottom: 2rem;
}
.ambiance-section-title {
	font-size: 1.3em;
	font-weight: 600;
	margin-bottom: 1.5rem;
	color: #fff;
}
.ambiance-player-bar {
	position: fixed;
	left: 0;
	bottom: 0;
	width: 100vw;
	background: #282828;
	z-index: 100;
	box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.2);
	padding: 0.5rem 0 0.5rem 0;
	display: flex;
	justify-content: center;
	align-items: center;
	border-top: 1px solid #232323;
}
</style>
