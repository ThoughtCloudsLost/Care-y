/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Greetings_Audio_ConvertingInputs */

const en_admin_greetings_audio_converting = /** @type {(inputs: Admin_Greetings_Audio_ConvertingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Converting audio...`)
};

const es_admin_greetings_audio_converting = /** @type {(inputs: Admin_Greetings_Audio_ConvertingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Convirtiendo audio...`)
};

const en_xa2_admin_greetings_audio_converting = /** @type {(inputs: Admin_Greetings_Audio_ConvertingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Cònvèrtìng àùdìò... ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Converting audio..." |
*
* @param {Admin_Greetings_Audio_ConvertingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_greetings_audio_converting = /** @type {((inputs?: Admin_Greetings_Audio_ConvertingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Greetings_Audio_ConvertingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_greetings_audio_converting(inputs)
	if (locale === "en-XA") return en_xa2_admin_greetings_audio_converting(inputs)
	return en_admin_greetings_audio_converting(inputs)
});