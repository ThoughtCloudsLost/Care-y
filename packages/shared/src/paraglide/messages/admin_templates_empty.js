/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Templates_EmptyInputs */

const en_admin_templates_empty = /** @type {(inputs: Admin_Templates_EmptyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No templates yet.`)
};

const es_admin_templates_empty = /** @type {(inputs: Admin_Templates_EmptyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Aún no hay plantillas.`)
};

const en_xa2_admin_templates_empty = /** @type {(inputs: Admin_Templates_EmptyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nò tèmplàtès yèt. ••••••⟧`)
};

/**
* | output |
* | --- |
* | "No templates yet." |
*
* @param {Admin_Templates_EmptyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_templates_empty = /** @type {((inputs?: Admin_Templates_EmptyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Templates_EmptyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_templates_empty(inputs)
	if (locale === "en-XA") return en_xa2_admin_templates_empty(inputs)
	return en_admin_templates_empty(inputs)
});