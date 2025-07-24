<template>
	<div class="audio-player">
		<audio ref="audio" v-if="currentAudio" @ended="onEnded">
			<source :src="currentAudio" type="audio/mpeg" />
			Your browser does not support the audio element.
		</audio>
		<div class="controls p-d-flex p-jc-center p-ai-center">
			<button @click="playPrevious" :disabled="!currentAudio" aria-label="Previous" class="prev-btn">⏮</button>
			<button
				@click="togglePlayPause"
				:disabled="!currentAudio"
				:aria-label="playPauseAriaLabel"
				class="play-pause-btn"
				:class="{ active: playbackState === 'playing' }"
			>
				<span v-if="playbackState === 'playing'">⏸</span>
				<span v-else>▶</span>
			</button>
			<button @click="onStop" :disabled="!currentAudio" aria-label="Stop" class="stop-btn">⏹</button>
			<button @click="playNext" :disabled="!currentAudio" aria-label="Next" class="next-btn">⏭</button>
			<button class="loop-btn" :class="{ active: loop }" @click="$emit('toggle-loop')" aria-label="Toggle loop">
				<span v-if="loop">🔁</span>
				<span v-else>➡️</span>
			</button>
		</div>
	</div>
</template>

<script lang="ts">
import { ref, watch, defineComponent, computed } from "vue";

export default defineComponent({
	name: "AudioPlayer",
	props: {
		currentAudio: {
			type: String,
			required: false,
			default: "",
		},
		playbackState: {
			type: String,
			default: "stopped",
		},
		loop: {
			type: Boolean,
			default: false,
		},
		audioFiles: {
			type: Array,
			default: () => [],
		},
		selectedIndex: {
			type: Number,
			default: -1,
		},
	},
	emits: ["play", "pause", "stop", "ended", "previous", "next", "toggle-loop", "update:selectedIndex"],
	setup(props, { emit }) {
		const audio = ref(null);

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

		const togglePlayPause = () => {
			if (props.playbackState === "playing") {
				onPause();
			} else {
				onPlay();
			}
		};

		const playPauseAriaLabel = computed(() => (props.playbackState === "playing" ? "Pause" : "Play"));

		const playPrevious = () => {
			if (!props.audioFiles.length) return;
			let newIndex = props.selectedIndex;
			if (props.selectedIndex > 0) {
				newIndex = props.selectedIndex - 1;
			} else if (props.loop && props.audioFiles.length > 0) {
				newIndex = props.audioFiles.length - 1;
			} else {
				return;
			}
			emit("update:selectedIndex", newIndex);
			emit("previous");
		};

		const playNext = () => {
			if (!props.audioFiles.length) return;
			let newIndex = props.selectedIndex;
			if (props.selectedIndex < props.audioFiles.length - 1) {
				newIndex = props.selectedIndex + 1;
			} else if (props.loop && props.audioFiles.length > 0) {
				newIndex = 0;
			} else {
				return;
			}
			emit("update:selectedIndex", newIndex);
			emit("next");
		};

		const onEnded = () => {
			if (props.loop) {
				playNext();
			} else {
				emit("ended");
			}
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
			togglePlayPause,
			playPauseAriaLabel,
			playPrevious,
			playNext,
		};
	},
});
</script>

<style scoped>
.audio-player {
	display: flex;
	flex-direction: column;
	align-items: center;
	width: 100%;
}
.controls {
	margin-top: 0;
	width: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
}
.controls button {
	font-size: 1.5em;
	padding: 6px 14px;
	margin: 0 8px;
	border-radius: 6px;
	border: 1px solid #ccc;
	background: #232b3b;
	color: #fff;
	cursor: pointer;
	transition: background 0.2s, color 0.2s, border 0.2s;
}
.controls button:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}
.play-pause-btn.active {
	background: #1db954;
	color: #232b3b;
	border-color: #1db954;
}
.loop-btn.active {
	background: #1db954;
	color: #232b3b;
	border-color: #1db954;
}
.play-pause-btn:hover:not(:disabled):not(.active) {
	background: #1db954;
	color: #232b3b;
	border-color: #1db954;
}
.loop-btn:hover:not(:disabled):not(.active) {
	background: #1db954;
	color: #232b3b;
	border-color: #1db954;
}
.stop-btn:hover:not(:disabled) {
	background: #b00;
	color: #fff;
	border-color: #b00;
}
.prev-btn:hover:not(:disabled),
.next-btn:hover:not(:disabled) {
	background: #1976d2;
	color: #fff;
	border-color: #1976d2;
}
</style>
