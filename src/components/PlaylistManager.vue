<template>
	<div class="playlist-manager">
		<form @submit.prevent="handleCreate" class="p-d-flex p-ai-center p-mb-3">
			<InputText v-model="newPlaylistName" placeholder="New playlist name" class="p-mr-2" style="width: 70%" />
			<Button type="submit" icon="pi pi-plus" class="p-button-sm p-button-success" :disabled="!newPlaylistName.trim()" />
		</form>
		<Listbox
			:options="playlists"
			optionLabel="name"
			optionValue="name"
			:value="playlists[selectedPlaylistIndex]?.name || ''"
			@change="(e) => emitSelect(playlists.findIndex((p) => p.name === e.value))"
			class="p-mb-3"
			style="width: 100%"
			:filter="true"
			filterPlaceholder="Search playlists"
			listStyle="max-height:180px"
		>
			<template #option="slotProps">
				<div class="p-d-flex p-jc-between p-ai-center">
					<span>{{ slotProps.option.name }}</span>
					<Button
						icon="pi pi-trash"
						class="p-button-text p-button-danger p-ml-2"
						@click.stop="emitDelete(playlists.indexOf(slotProps.option))"
					/>
				</div>
			</template>
		</Listbox>
		<Divider class="p-mb-2" />
		<div v-if="selectedPlaylist">
			<h3 class="p-mb-2">Files in "{{ selectedPlaylist.name }}"</h3>
			<Listbox
				:options="selectedPlaylist.audioFiles"
				optionLabel="name"
				optionValue="url"
				:value="null"
				class="p-mb-2"
				style="width: 100%"
				listStyle="max-height:180px"
			>
				<template #option="slotProps">
					<div class="p-d-flex p-jc-between p-ai-center">
						<span>{{ slotProps.option.name }}</span>
						<span>
							<Button
								icon="pi pi-arrow-up"
								class="p-button-text p-button-secondary p-mr-1"
								@click.stop="emitMoveFile(slotProps.index, 'up')"
								:disabled="slotProps.index === 0"
							/>
							<Button
								icon="pi pi-arrow-down"
								class="p-button-text p-button-secondary p-mr-1"
								@click.stop="emitMoveFile(slotProps.index, 'down')"
								:disabled="slotProps.index === selectedPlaylist.audioFiles.length - 1"
							/>
							<Button
								icon="pi pi-trash"
								class="p-button-text p-button-danger"
								@click.stop="emitRemoveFile(slotProps.index)"
							/>
						</span>
					</div>
				</template>
			</Listbox>
			<div v-if="audioFiles.length" class="p-d-flex p-ai-center">
				<Dropdown
					v-model="selectedFileToAdd"
					:options="availableFilesToAdd"
					optionLabel="name"
					optionValue="url"
					placeholder="Add file to playlist"
					class="p-mr-2"
					style="width: 70%"
				/>
				<Button icon="pi pi-plus" class="p-button-sm p-button-success" @click="addFileToPlaylist" :disabled="!selectedFileToAdd" />
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
	margin: 0;
}
</style>
