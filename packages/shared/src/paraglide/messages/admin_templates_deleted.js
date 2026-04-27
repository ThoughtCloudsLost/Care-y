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

/**
* | output |
* | --- |
* | "Template deleted." |
*
* @param {Admin_Templates_DeletedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_templates_deleted = /** @type {((inputs?: Admin_Templates_DeletedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Templates_DeletedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_templates_deleted(inputs)
	return es_admin_templates_deleted(inputs)
});