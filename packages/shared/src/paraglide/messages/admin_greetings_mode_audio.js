/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Greetings_Mode_AudioInputs */

const en_admin_greetings_mode_audio = /** @type {(inputs: Admin_Greetings_Mode_AudioInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Audio`)
};

const es_admin_greetings_mode_audio = /** @type {(inputs: Admin_Greetings_Mode_AudioInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Audio`)
};

/**
* | output |
* | --- |
* | "Audio" |
*
* @param {Admin_Greetings_Mode_AudioInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_greetings_mode_audio = /** @type {((inputs?: Admin_Greetings_Mode_AudioInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Greetings_Mode_AudioInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_greetings_mode_audio(inputs)
	return es_admin_greetings_mode_audio(inputs)
});