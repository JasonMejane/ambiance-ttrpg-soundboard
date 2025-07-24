<template>
	<div id="app" class="p-m-0 p-p-0">
		<div class="p-d-flex p-flex-column p-ai-center p-mb-4">
			<h1 class="p-mt-4 p-mb-2">TTRPG Ambiance</h1>
			<Divider class="p-mb-3" />
		</div>
		<div class="dashboard p-d-flex p-flex-row p-jc-center p-ai-start p-mt-2">
			<div class="sidebar p-mr-4" style="min-width: 260px; max-width: 320px; width: 100%">
				<Card>
					<template #title>Playlists</template>
					<template #content>
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
							<Button
								label="Load Playlist"
								icon="pi pi-download"
								class="p-button-sm p-button-outlined"
								@click="loadPlaylist"
							/>
						</div>
					</template>
				</Card>
			</div>
			<div class="main-content" style="flex: 1; min-width: 0">
				<Card class="p-mb-4">
					<template #title>Audio Files</template>
					<template #content>
						<FileList
							:audioFiles="audioFiles"
							@file-selected="onFileSelect"
							@file-list-updated="onFileListUpdated"
							:selectedIndex="selectedIndex"
							:playingIndex="selectedIndex"
							:playbackState="playbackState"
							@update:selectedIndex="onSelectedIndexUpdate"
						/>
					</template>
				</Card>
			</div>
		</div>
		<div class="player-footer">
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
#app {
	min-height: 100vh;
}
.dashboard {
	display: flex;
	justify-content: flex-start;
	align-items: flex-start;
	margin-top: 0;
}
.sidebar {
	min-width: 260px;
	max-width: 320px;
	width: 100%;
	margin-right: 2rem;
}
.main-content {
	flex: 1;
	min-width: 0;
}
.player-footer {
	position: sticky;
	bottom: 0;
	left: 0;
	width: 100%;
	background: var(--surface-ground, #1a1a1a);
	z-index: 100;
	box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.2);
	padding: 0.5rem 0 0.5rem 0;
	display: flex;
	justify-content: center;
	align-items: center;
}
.loop-btn {
	margin-left: 1.5rem;
	font-size: 1.5em;
	background: none;
	border: none;
	color: #fff;
	cursor: pointer;
	transition: color 0.2s;
	outline: none;
}
.loop-btn.active {
	color: #1db954;
}
.loop-btn:hover {
	color: #1db954;
}
</style>
