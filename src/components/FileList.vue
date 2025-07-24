<template>
	<div class="file-list">
		<h2>Audio Files</h2>
		<label for="audio-file-input">Select audio files:</label>
		<input id="audio-file-input" ref="fileInput" type="file" multiple accept="audio/*" @change="onFilesSelected" />
		<div v-if="!fileApiSupported" class="warning">Your browser does not support the File API required for local audio selection.</div>
		<ul>
			<li
				v-for="(file, idx) in audioFiles"
				:key="file.name + file.url"
				@click="selectFile(file, idx)"
				:class="{ selected: idx === selectedIndex }"
			>
				<span v-if="idx === selectedIndex">▶ </span>{{ file.name }}
			</li>
		</ul>
	</div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, PropType } from "vue";
import type { AudioFile } from "../types";

export default defineComponent({
	name: "FileList",
	props: {
		audioFiles: {
			type: Array as PropType<AudioFile[]>,
			required: true,
			default: () => [],
		},
		selectedIndex: {
			type: Number as PropType<number>,
			default: -1,
		},
	},
	setup(props, { emit }) {
		const fileInput = ref<HTMLInputElement | null>(null);
		const fileApiSupported = ref(true);

		onMounted(() => {
			fileApiSupported.value = !!(window.File && window.FileReader && window.FileList && window.Blob);
		});

		const onFilesSelected = (event: Event) => {
			const input = event.target as HTMLInputElement;
			if (!input.files) return;
			const files = Array.from(input.files).map((file) => ({
				name: file.name,
				url: URL.createObjectURL(file),
				duration: 0, // Will be updated later if needed
				isPlaying: false,
			}));
			// Clear the input so the same file can be selected again
			if (fileInput.value) fileInput.value.value = "";
			emit("file-list-updated", files);
		};

		const selectFile = (file: AudioFile, idx: number) => {
			emit("file-selected", file);
			emit("update:selectedIndex", idx);
		};

		return {
			onFilesSelected,
			selectFile,
			fileInput,
			fileApiSupported,
		};
	},
});
</script>

<style scoped>
.file-list {
	margin: 20px;
}

.file-list h2 {
	font-size: 1.5em;
}

.file-list label {
	display: block;
	margin-bottom: 8px;
}

.file-list input[type="file"] {
	margin-bottom: 12px;
}

.file-list ul {
	list-style-type: none;
	padding: 0;
}

.file-list li {
	cursor: pointer;
	padding: 5px;
	transition: background-color 0.3s;
}

.file-list li.selected {
	background-color: #b3d4fc;
	font-weight: bold;
}

.file-list li:hover {
	background-color: #f0f0f0;
}

.warning {
	color: #b00;
	margin-bottom: 10px;
}
</style>
