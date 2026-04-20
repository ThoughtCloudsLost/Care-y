/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Templates_DuplicateInputs */

const en_admin_templates_duplicate = /** @type {(inputs: Admin_Templates_DuplicateInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A template with this type and language already exists.`)
};

const es_admin_templates_duplicate = /** @type {(inputs: Admin_Templates_DuplicateInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ya existe una plantilla con este tipo e idioma.`)
};

/**
* | output |
* | --- |
* | "A template with this type and language already exists." |
*
* @param {Admin_Templates_DuplicateInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_templates_duplicate = /** @type {((inputs?: Admin_Templates_DuplicateInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Templates_DuplicateInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_templates_duplicate(inputs)
	return es_admin_templates_duplicate(inputs)
});