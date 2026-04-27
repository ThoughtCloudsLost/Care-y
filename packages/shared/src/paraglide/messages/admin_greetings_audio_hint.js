/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Greetings_Audio_HintInputs */

const en_admin_greetings_audio_hint = /** @type {(inputs: Admin_Greetings_Audio_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Upload a WAV, MP3, OGG, or M4A file (max 5 MB). This recording will play to callers.`)
};

const es_admin_greetings_audio_hint = /** @type {(inputs: Admin_Greetings_Audio_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Suba un archivo WAV, MP3, OGG o M4A (max 5 MB). Esta grabacion se reproducira para las personas que llamen.`)
};

/**
* | output |
* | --- |
* | "Upload a WAV, MP3, OGG, or M4A file (max 5 MB). This recording will play to callers." |
*
* @param {Admin_Greetings_Audio_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_greetings_audio_hint = /** @type {((inputs?: Admin_Greetings_Audio_HintInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Greetings_Audio_HintInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_greetings_audio_hint(inputs)
	return es_admin_greetings_audio_hint(inputs)
});