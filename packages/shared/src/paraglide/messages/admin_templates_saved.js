/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Templates_SavedInputs */

const en_admin_templates_saved = /** @type {(inputs: Admin_Templates_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Template saved.`)
};

const es_admin_templates_saved = /** @type {(inputs: Admin_Templates_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Plantilla guardada.`)
};

/**
* | output |
* | --- |
* | "Template saved." |
*
* @param {Admin_Templates_SavedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_templates_saved = /** @type {((inputs?: Admin_Templates_SavedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Templates_SavedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_templates_saved(inputs)
	return es_admin_templates_saved(inputs)
});