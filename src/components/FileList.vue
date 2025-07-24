<template>
	<div class="file-list">
		<div class="p-d-flex p-ai-center p-mb-3">
			<input
				id="audio-file-input"
				ref="fileInput"
				type="file"
				multiple
				accept="audio/*"
				@change="onFilesSelected"
				style="display: none"
			/>
			<Button
				icon="pi pi-folder-open"
				label="Browse Audio Files"
				class="p-button-sm p-button-secondary"
				@click="triggerFileInput"
				aria-label="Select audio files"
			/>
			<span v-if="audioFiles.length" class="p-ml-2 file-list-selected-label">
				{{ audioFiles.length }} file{{ audioFiles.length > 1 ? "s" : "" }} selected
			</span>
		</div>
		<div v-if="!fileApiSupported" class="warning">Your browser does not support the File API required for local audio selection.</div>
		<table class="file-table">
			<tbody>
				<tr
					v-for="(file, idx) in audioFiles"
					:key="file.name + file.url"
					@click="selectFile(file, idx)"
					:class="{ selected: idx === selectedIndex }"
				>
					<td class="indicator-cell">
						<span v-if="idx === playingIndex" class="playing-indicator" :class="indicatorClass">
							<template v-if="playbackState === 'playing'">▶</template>
							<template v-else-if="playbackState === 'paused'">⏸</template>
							<template v-else>⏹</template>
						</span>
					</td>
					<td class="filename-cell">{{ file.name }}</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, PropType, computed } from "vue";
import Button from "primevue/button";
import type { AudioFile } from "../types";

export default defineComponent({
	name: "FileList",
	components: { Button },
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
		playingIndex: {
			type: Number as PropType<number>,
			default: -1,
		},
		playbackState: {
			type: String as PropType<"playing" | "paused" | "stopped">,
			default: "stopped",
		},
	},
	setup(props, { emit }) {
		const fileInput = ref<HTMLInputElement | null>(null);
		const fileApiSupported = ref(true);

		onMounted(() => {
			fileApiSupported.value = !!(window.File && window.FileReader && window.FileList && window.Blob);
		});

		const triggerFileInput = () => {
			if (fileInput.value) fileInput.value.click();
		};

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

		const indicatorClass = computed(() => {
			if (props.playingIndex === props.selectedIndex) {
				if (props.playbackState === "playing") return "animated playing";
				if (props.playbackState === "paused") return "paused";
				if (props.playbackState === "stopped") return "stopped";
			}
			return "";
		});

		return {
			onFilesSelected,
			selectFile,
			fileInput,
			fileApiSupported,
			indicatorClass,
			triggerFileInput,
		};
	},
});
</script>

<style scoped>
.file-list {
	margin: 20px;
}
.file-list-selected-label {
	color: var(--primary-color-text, #90caf9);
	font-size: 0.95em;
}
.file-list h2 {
	font-size: 1.5em;
}
.file-table {
	width: 100%;
	border-collapse: separate;
	border-spacing: 0 0.25rem;
	margin-top: 1.5rem;
}
.file-table tr {
	cursor: pointer;
	transition: background-color 0.2s;
	border-radius: 10px;
}
.file-table tr.selected {
	background: #232323;
	font-weight: bold;
}
.file-table tr:hover {
	background: #282828;
}
.indicator-cell {
	width: 36px;
	text-align: center;
}
.filename-cell {
	padding-left: 0.5rem;
	font-size: 1.08em;
	color: #fff;
	letter-spacing: 0.2px;
}
.playing-indicator {
	font-size: 1.3em;
	vertical-align: middle;
	display: inline-block;
}
.animated.playing {
	color: #1db954;
	animation: pulse 0.7s infinite;
}
.paused {
	color: #f5a623;
}
.stopped {
	color: #b00;
}
@keyframes pulse {
	0% {
		transform: scale(1);
		opacity: 1;
	}
	50% {
		transform: scale(1.5);
		opacity: 0.6;
	}
	100% {
		transform: scale(1);
		opacity: 1;
	}
}
.warning {
	color: #b00;
	margin-bottom: 10px;
}
</style>
