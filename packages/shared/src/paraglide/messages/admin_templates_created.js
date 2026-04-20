/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Templates_CreatedInputs */

const en_admin_templates_created = /** @type {(inputs: Admin_Templates_CreatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Template created.`)
};

const es_admin_templates_created = /** @type {(inputs: Admin_Templates_CreatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Plantilla creada.`)
};

/**
* | output |
* | --- |
* | "Template created." |
*
* @param {Admin_Templates_CreatedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_templates_created = /** @type {((inputs?: Admin_Templates_CreatedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Templates_CreatedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_templates_created(inputs)
	return es_admin_templates_created(inputs)
});