<template>
	<div class="playlist-manager">
		<h2>Playlists</h2>
		<form @submit.prevent="handleCreate">
			<input v-model="newPlaylistName" placeholder="New playlist name" />
			<button type="submit" title="Add playlist">➕</button>
		</form>
		<ul>
			<li
				v-for="(playlist, idx) in playlists"
				:key="playlist.name + idx"
				:class="{ selected: idx === selectedPlaylistIndex }"
				@click="emitSelect(idx)"
			>
				<span v-if="idx === selectedPlaylistIndex">▶ </span>{{ playlist.name }}
				<button class="delete-btn" @click.stop="emitDelete(idx)" title="Delete playlist">🗑️</button>
			</li>
		</ul>

		<div v-if="selectedPlaylist">
			<h3>Files in "{{ selectedPlaylist.name }}"</h3>
			<ul>
				<li v-for="(file, idx) in selectedPlaylist.audioFiles" :key="file.name + file.url">
					{{ file.name }}
					<button class="move-btn" @click="emitMoveFile(idx, 'up')" :disabled="idx === 0" title="Move up">⬆️</button>
					<button
						class="move-btn"
						@click="emitMoveFile(idx, 'down')"
						:disabled="idx === selectedPlaylist.audioFiles.length - 1"
						title="Move down"
					>
						⬇️
					</button>
					<button class="remove-btn" @click="emitRemoveFile(idx)" title="Remove from playlist">🗑️</button>
				</li>
			</ul>
			<div v-if="audioFiles.length">
				<label>Add file to playlist:</label>
				<select v-model="selectedFileToAdd">
					<option disabled value="">Select a file</option>
					<option v-for="file in availableFilesToAdd" :key="file.name + file.url" :value="file.url">
						{{ file.name }}
					</option>
				</select>
				<button @click="addFileToPlaylist" :disabled="!selectedFileToAdd" title="Add to playlist">➕</button>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, PropType } from "vue";
import type { Playlist, AudioFile } from "../types";

export default defineComponent({
	name: "PlaylistManager",
	props: {
		playlists: {
			type: Array as PropType<Playlist[]>,
			required: true,
			default: () => [],
		},
		selectedPlaylistIndex: {
			type: Number,
			default: -1,
		},
		selectedPlaylist: {
			type: Object as PropType<Playlist | null>,
			default: null,
		},
		audioFiles: {
			type: Array as PropType<AudioFile[]>,
			default: () => [],
		},
	},
	emits: [
		"create-playlist",
		"select-playlist",
		"delete-playlist",
		"add-file-to-playlist",
		"remove-file-from-playlist",
		"move-file-in-playlist",
	],
	setup(props, { emit }) {
		const newPlaylistName = ref("");
		const selectedFileToAdd = ref("");

		const handleCreate = () => {
			if (newPlaylistName.value.trim()) {
				emit("create-playlist", newPlaylistName.value.trim());
				newPlaylistName.value = "";
			}
		};

		const emitSelect = (idx: number) => {
			emit("select-playlist", idx);
		};

		const emitDelete = (idx: number) => {
			emit("delete-playlist", idx);
		};

		const emitRemoveFile = (fileIdx: number) => {
			emit("remove-file-from-playlist", fileIdx);
		};

		const emitMoveFile = (fileIdx: number, direction: "up" | "down") => {
			emit("move-file-in-playlist", { fileIdx, direction });
		};

		const addFileToPlaylist = () => {
			if (!selectedFileToAdd.value) return;
			emit("add-file-to-playlist", selectedFileToAdd.value);
			selectedFileToAdd.value = "";
		};

		const availableFilesToAdd = computed(() => {
			if (!props.selectedPlaylist) return props.audioFiles;
			// Only show files not already in the playlist
			return props.audioFiles.filter((file) => !props.selectedPlaylist!.audioFiles.some((f) => f.url === file.url));
		});

		return {
			newPlaylistName,
			handleCreate,
			emitSelect,
			emitDelete,
			emitRemoveFile,
			emitMoveFile,
			selectedFileToAdd,
			addFileToPlaylist,
			availableFilesToAdd,
		};
	},
});
</script>

<style scoped>
.playlist-manager {
	margin: 20px 0;
}

.playlist-manager h2 {
	font-size: 1.3em;
}

.playlist-manager form {
	margin-bottom: 10px;
}

.playlist-manager input {
	padding: 4px 8px;
	margin-right: 4px;
}

.playlist-manager ul {
	list-style-type: none;
	padding: 0;
}

.playlist-manager li {
	cursor: pointer;
	padding: 5px;
	transition: background-color 0.3s;
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.playlist-manager li.selected {
	background-color: #b3d4fc;
	font-weight: bold;
}

.playlist-manager li:hover {
	background-color: #f0f0f0;
}

.delete-btn,
.remove-btn,
.move-btn {
	background: none;
	border: none;
	color: #b00;
	cursor: pointer;
	font-size: 1em;
	margin-left: 8px;
}
.move-btn {
	color: #333;
}
.move-btn:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}
</style>
