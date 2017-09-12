const speechSynth = window.speechSynthesis;

export function speak(string, voice) {
	let utterance = new SpeechSynthesisUtterance(string);
	utterance.lang = 'en-US';
	if(voice !== undefined) utterance.voice = voice;
	speechSynth.speak(utterance);
};
