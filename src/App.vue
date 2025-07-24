<template>
	<div id="app">
		<h1>TTRPG Ambiance</h1>
		<div class="dashboard">
			<div class="sidebar">
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
				<div v-if="selectedPlaylist && selectedPlaylist.audioFiles.length" class="playlist-controls">
					<button @click="loadPlaylist">Load Playlist</button>
				</div>
			</div>
			<div class="main-content">
				<FileList
					:audioFiles="audioFiles"
					@file-selected="onFileSelect"
					@file-list-updated="onFileListUpdated"
					:selectedIndex="selectedIndex"
					:playingIndex="selectedIndex"
					:playbackState="playbackState"
					@update:selectedIndex="onSelectedIndexUpdate"
				/>
				<AudioPlayer
					ref="audioPlayerRef"
					:key="selectedFile?.url || ''"
					:currentAudio="selectedFile?.url || ''"
					@ended="onAudioEnded"
					@play="onPlay"
					@pause="onPause"
					@stop="onStop"
				/>
			</div>
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
		};
	},
});
</script>

<style scoped>
#app {
	text-align: center;
	margin-top: 20px;
}
.dashboard {
	display: flex;
	justify-content: flex-start;
	align-items: flex-start;
	margin-top: 30px;
}
.sidebar {
	width: 250px;
	min-width: 200px;
	margin-right: 32px;
}
.main-content {
	flex: 1;
	min-width: 0;
}
.playlist-controls {
	margin-top: 24px;
	display: flex;
	flex-direction: column;
	gap: 8px;
}
.playlist-controls button {
	padding: 6px 12px;
	font-size: 1em;
	border-radius: 4px;
	border: 1px solid #ccc;
	background: #f7f7f7;
	cursor: pointer;
}
.playlist-controls button:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}
</style>
