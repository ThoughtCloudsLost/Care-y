/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Templates_DeletedInputs */

const en_admin_templates_deleted = /** @type {(inputs: Admin_Templates_DeletedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Template deleted.`)
};

const es_admin_templates_deleted = /** @type {(inputs: Admin_Templates_DeletedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Plantilla eliminada.`)
};

const en_xa2_admin_templates_deleted = /** @type {(inputs: Admin_Templates_DeletedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Tèmplàtè dèlètèd. ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Template deleted." |
*
* @param {Admin_Templates_DeletedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_templates_deleted = /** @type {((inputs?: Admin_Templates_DeletedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Templates_DeletedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_templates_deleted(inputs)
	if (locale === "en-XA") return en_xa2_admin_templates_deleted(inputs)
	return en_admin_templates_deleted(inputs)
});