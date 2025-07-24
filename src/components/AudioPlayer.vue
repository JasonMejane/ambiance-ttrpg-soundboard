<template>
	<div class="audio-player">
		<audio ref="audio" v-if="currentAudio" @ended="onEnded">
			<source :src="currentAudio" type="audio/mpeg" />
			Your browser does not support the audio element.
		</audio>
		<div v-else>No audio selected.</div>
		<div class="controls">
			<button @click="onPlay" :disabled="!currentAudio" aria-label="Play">▶</button>
			<button @click="onPause" :disabled="!currentAudio" aria-label="Pause">⏸</button>
			<button @click="onStop" :disabled="!currentAudio" aria-label="Stop">⏹</button>
		</div>
	</div>
</template>

<script lang="ts">
import { ref, watch, defineComponent } from "vue";

export default defineComponent({
	name: "AudioPlayer",
	props: {
		currentAudio: {
			type: String,
			required: false,
			default: "",
		},
	},
	emits: ["play", "pause", "stop", "ended"],
	setup(props, { emit }) {
		const audio = ref<HTMLAudioElement | null>(null);

		const onPlay = () => {
			if (audio.value) {
				audio.value.play();
				emit("play");
			}
		};

		const onPause = () => {
			if (audio.value) {
				audio.value.pause();
				emit("pause");
			}
		};

		const onStop = () => {
			if (audio.value) {
				audio.value.pause();
				audio.value.currentTime = 0;
				emit("stop");
			}
		};

		const onEnded = () => {
			emit("ended");
		};

		// Stop playback if the audio source changes
		watch(
			() => props.currentAudio,
			() => {
				onStop();
			}
		);

		return {
			audio,
			onPlay,
			onPause,
			onStop,
			onEnded,
		};
	},
});
</script>

<style scoped>
.audio-player {
	display: flex;
	flex-direction: column;
	align-items: center;
}

.controls {
	margin-top: 10px;
}
.controls button {
	font-size: 1.5em;
	padding: 6px 14px;
	margin: 0 4px;
	border-radius: 6px;
	border: 1px solid #ccc;
	background: #f7f7f7;
	cursor: pointer;
	transition: background 0.2s;
}
.controls button:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}
</style>
