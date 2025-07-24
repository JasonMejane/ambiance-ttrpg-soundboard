<template>
	<div class="audio-player">
		<audio ref="audio" v-if="currentAudio" @ended="onEnded">
			<source :src="currentAudio" type="audio/mpeg" />
			Your browser does not support the audio element.
		</audio>
		<div v-else>No audio selected.</div>
		<div class="controls">
			<button @click="play" :disabled="!currentAudio">Play</button>
			<button @click="pause" :disabled="!currentAudio">Pause</button>
			<button @click="stop" :disabled="!currentAudio">Stop</button>
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
	setup(props) {
		const audio = ref<HTMLAudioElement | null>(null);

		const play = () => {
			if (audio.value) {
				audio.value.play();
			}
		};

		const pause = () => {
			if (audio.value) {
				audio.value.pause();
			}
		};

		const stop = () => {
			if (audio.value) {
				audio.value.pause();
				audio.value.currentTime = 0;
			}
		};

		const onEnded = () => {
			// Handle audio ended event
		};

		// Stop playback if the audio source changes
		watch(
			() => props.currentAudio,
			() => {
				stop();
			}
		);

		return {
			audio,
			play,
			pause,
			stop,
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
</style>
