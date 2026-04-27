/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown>, max: NonNullable<unknown> }} Admin_Templates_Char_CountInputs */

const en_admin_templates_char_count = /** @type {(inputs: Admin_Templates_Char_CountInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} / ${i?.max} characters`)
};

const es_admin_templates_char_count = /** @type {(inputs: Admin_Templates_Char_CountInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} / ${i?.max} caracteres`)
};

/**
* | output |
* | --- |
* | "{count} / {max} characters" |
*
* @param {Admin_Templates_Char_CountInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_templates_char_count = /** @type {((inputs: Admin_Templates_Char_CountInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Templates_Char_CountInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_templates_char_count(inputs)
	return es_admin_templates_char_count(inputs)
});