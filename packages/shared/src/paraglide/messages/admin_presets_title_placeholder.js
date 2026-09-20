/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Presets_Title_PlaceholderInputs */

const en_admin_presets_title_placeholder = /** @type {(inputs: Admin_Presets_Title_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A short name for this reply`)
};

const es_admin_presets_title_placeholder = /** @type {(inputs: Admin_Presets_Title_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Un nombre corto para esta respuesta`)
};

/**
* | output |
* | --- |
* | "A short name for this reply" |
*
* @param {Admin_Presets_Title_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_presets_title_placeholder = /** @type {((inputs?: Admin_Presets_Title_PlaceholderInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Presets_Title_PlaceholderInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_presets_title_placeholder(inputs)
	return en_admin_presets_title_placeholder(inputs)
});