/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Greetings_Replace_AudioInputs */

const en_admin_greetings_replace_audio = /** @type {(inputs: Admin_Greetings_Replace_AudioInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Replace audio`)
};

const es_admin_greetings_replace_audio = /** @type {(inputs: Admin_Greetings_Replace_AudioInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Reemplazar audio`)
};

const en_xa2_admin_greetings_replace_audio = /** @type {(inputs: Admin_Greetings_Replace_AudioInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rèplàcè àùdìò ••••⟧`)
};

/**
* | output |
* | --- |
* | "Replace audio" |
*
* @param {Admin_Greetings_Replace_AudioInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_greetings_replace_audio = /** @type {((inputs?: Admin_Greetings_Replace_AudioInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Greetings_Replace_AudioInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_greetings_replace_audio(inputs)
	if (locale === "en-XA") return en_xa2_admin_greetings_replace_audio(inputs)
	return en_admin_greetings_replace_audio(inputs)
});