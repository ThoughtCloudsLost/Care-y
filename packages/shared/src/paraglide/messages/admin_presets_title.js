/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Presets_TitleInputs */

const en_admin_presets_title = /** @type {(inputs: Admin_Presets_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Saved Replies`)
};

const es_admin_presets_title = /** @type {(inputs: Admin_Presets_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Respuestas guardadas`)
};

/**
* | output |
* | --- |
* | "Saved Replies" |
*
* @param {Admin_Presets_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_presets_title = /** @type {((inputs?: Admin_Presets_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Presets_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_presets_title(inputs)
	return en_admin_presets_title(inputs)
});