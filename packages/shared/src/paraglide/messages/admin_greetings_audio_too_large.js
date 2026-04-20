/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Greetings_Audio_Too_LargeInputs */

const en_admin_greetings_audio_too_large = /** @type {(inputs: Admin_Greetings_Audio_Too_LargeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Audio file must be under 5 MB.`)
};

const es_admin_greetings_audio_too_large = /** @type {(inputs: Admin_Greetings_Audio_Too_LargeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El archivo de audio debe ser menor a 5 MB.`)
};

/**
* | output |
* | --- |
* | "Audio file must be under 5 MB." |
*
* @param {Admin_Greetings_Audio_Too_LargeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_greetings_audio_too_large = /** @type {((inputs?: Admin_Greetings_Audio_Too_LargeInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Greetings_Audio_Too_LargeInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_greetings_audio_too_large(inputs)
	return es_admin_greetings_audio_too_large(inputs)
});