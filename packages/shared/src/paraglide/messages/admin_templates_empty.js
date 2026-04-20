/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Templates_EmptyInputs */

const en_admin_templates_empty = /** @type {(inputs: Admin_Templates_EmptyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No templates yet.`)
};

const es_admin_templates_empty = /** @type {(inputs: Admin_Templates_EmptyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Aun no hay plantillas.`)
};

/**
* | output |
* | --- |
* | "No templates yet." |
*
* @param {Admin_Templates_EmptyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_templates_empty = /** @type {((inputs?: Admin_Templates_EmptyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Templates_EmptyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_templates_empty(inputs)
	return es_admin_templates_empty(inputs)
});