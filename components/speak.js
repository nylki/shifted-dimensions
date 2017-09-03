const speechSynth = window.speechSynthesis;

export function speak(string, voice) {
	let utterance = new SpeechSynthesisUtterance(string);
	if(voice !== undefined) utterance.voice = voice;
	speechSynth.speak(utterance);
};
