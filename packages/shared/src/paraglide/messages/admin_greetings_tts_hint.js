/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Greetings_Tts_HintInputs */

const en_admin_greetings_tts_hint = /** @type {(inputs: Admin_Greetings_Tts_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This text will be read aloud to callers using text-to-speech.`)
};

const es_admin_greetings_tts_hint = /** @type {(inputs: Admin_Greetings_Tts_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Este texto se leera en voz alta a los llamantes mediante sintesis de voz.`)
};

/**
* | output |
* | --- |
* | "This text will be read aloud to callers using text-to-speech." |
*
* @param {Admin_Greetings_Tts_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_greetings_tts_hint = /** @type {((inputs?: Admin_Greetings_Tts_HintInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Greetings_Tts_HintInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_greetings_tts_hint(inputs)
	return es_admin_greetings_tts_hint(inputs)
});