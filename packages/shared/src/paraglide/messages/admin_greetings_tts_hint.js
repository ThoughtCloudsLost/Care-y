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

const en_xa2_admin_greetings_tts_hint = /** @type {(inputs: Admin_Greetings_Tts_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thìs tèxt wìll bè rèàd àlòùd tò càllèrs ùsìng tèxt-tò-spèèch. •••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "This text will be read aloud to callers using text-to-speech." |
*
* @param {Admin_Greetings_Tts_HintInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_greetings_tts_hint = /** @type {((inputs?: Admin_Greetings_Tts_HintInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Greetings_Tts_HintInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_greetings_tts_hint(inputs)
	if (locale === "en-XA") return en_xa2_admin_greetings_tts_hint(inputs)
	return en_admin_greetings_tts_hint(inputs)
});