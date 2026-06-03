/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ language: NonNullable<unknown> }} Admin_Terminology_ResetInputs */

const en_admin_terminology_reset = /** @type {(inputs: Admin_Terminology_ResetInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Reset ${i?.language}`)
};

const es_admin_terminology_reset = /** @type {(inputs: Admin_Terminology_ResetInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Restablecer ${i?.language}`)
};

/**
* | output |
* | --- |
* | "Reset {language}" |
*
* @param {Admin_Terminology_ResetInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_terminology_reset = /** @type {((inputs: Admin_Terminology_ResetInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Terminology_ResetInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_terminology_reset(inputs)
	return es_admin_terminology_reset(inputs)
});