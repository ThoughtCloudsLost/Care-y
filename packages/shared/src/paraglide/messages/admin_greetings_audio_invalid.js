/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Greetings_Audio_InvalidInputs */

const en_admin_greetings_audio_invalid = /** @type {(inputs: Admin_Greetings_Audio_InvalidInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`File is not a valid audio format. Use WAV, MP3, OGG, or M4A.`)
};

const es_admin_greetings_audio_invalid = /** @type {(inputs: Admin_Greetings_Audio_InvalidInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El archivo no es un formato de audio valido. Use WAV, MP3, OGG o M4A.`)
};

/**
* | output |
* | --- |
* | "File is not a valid audio format. Use WAV, MP3, OGG, or M4A." |
*
* @param {Admin_Greetings_Audio_InvalidInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_greetings_audio_invalid = /** @type {((inputs?: Admin_Greetings_Audio_InvalidInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Greetings_Audio_InvalidInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_greetings_audio_invalid(inputs)
	return es_admin_greetings_audio_invalid(inputs)
});