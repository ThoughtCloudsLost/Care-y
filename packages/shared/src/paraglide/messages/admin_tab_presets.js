/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Tab_PresetsInputs */

const en_admin_tab_presets = /** @type {(inputs: Admin_Tab_PresetsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Saved Replies`)
};

const es_admin_tab_presets = /** @type {(inputs: Admin_Tab_PresetsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Respuestas guardadas`)
};

/**
* | output |
* | --- |
* | "Saved Replies" |
*
* @param {Admin_Tab_PresetsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_tab_presets = /** @type {((inputs?: Admin_Tab_PresetsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Tab_PresetsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_tab_presets(inputs)
	return en_admin_tab_presets(inputs)
});