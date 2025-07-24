<template>
	<div id="app">
		<h1>Music Player</h1>
		<FileList
			:audioFiles="audioFiles"
			@file-selected="onFileSelect"
			@file-list-updated="onFileListUpdated"
			:selectedIndex="selectedIndex"
			@update:selectedIndex="onSelectedIndexUpdate"
		/>
		<AudioPlayer :key="selectedFile?.url || ''" :currentAudio="selectedFile?.url || ''" />
	</div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import FileList from "./components/FileList.vue";
import AudioPlayer from "./components/AudioPlayer.vue";
import type { AudioFile } from "./types";

export default defineComponent({
	components: {
		FileList,
		AudioPlayer,
	},
	setup() {
		const selectedFile = ref<AudioFile | null>(null);
		const selectedIndex = ref<number>(-1);
		const audioFiles = ref<AudioFile[]>([]);

		const onFileSelect = (file: AudioFile) => {
			selectedFile.value = file;
		};

		const onFileListUpdated = (files: AudioFile[]) => {
			audioFiles.value = files;
			selectedIndex.value = files.length > 0 ? 0 : -1;
			selectedFile.value = files.length > 0 ? files[0] : null;
		};

		const onSelectedIndexUpdate = (idx: number) => {
			selectedIndex.value = idx;
			selectedFile.value = audioFiles.value[idx] || null;
		};

		return {
			selectedFile,
			selectedIndex,
			audioFiles,
			onFileSelect,
			onFileListUpdated,
			onSelectedIndexUpdate,
		};
	},
});
</script>

<style scoped>
#app {
	text-align: center;
	margin-top: 20px;
}
</style>
