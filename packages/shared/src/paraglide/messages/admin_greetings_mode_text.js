/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Greetings_Mode_TextInputs */

const en_admin_greetings_mode_text = /** @type {(inputs: Admin_Greetings_Mode_TextInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Text`)
};

const es_admin_greetings_mode_text = /** @type {(inputs: Admin_Greetings_Mode_TextInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Texto`)
};

/**
* | output |
* | --- |
* | "Text" |
*
* @param {Admin_Greetings_Mode_TextInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_greetings_mode_text = /** @type {((inputs?: Admin_Greetings_Mode_TextInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Greetings_Mode_TextInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_greetings_mode_text(inputs)
	return es_admin_greetings_mode_text(inputs)
});