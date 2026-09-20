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

const en_xa2_admin_templates_saved = /** @type {(inputs: Admin_Templates_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Tèmplàtè sàvèd. •••••⟧`)
};

/**
* | output |
* | --- |
* | "Template saved." |
*
* @param {Admin_Templates_SavedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_templates_saved = /** @type {((inputs?: Admin_Templates_SavedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Templates_SavedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_templates_saved(inputs)
	if (locale === "en-XA") return en_xa2_admin_templates_saved(inputs)
	return en_admin_templates_saved(inputs)
});