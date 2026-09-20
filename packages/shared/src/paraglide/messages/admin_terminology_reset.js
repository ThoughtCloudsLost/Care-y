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

const en_xa2_admin_terminology_reset = /** @type {(inputs: Admin_Terminology_ResetInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Rèsèt  ••${i?.language}⟧`)
};

/**
* | output |
* | --- |
* | "Reset {language}" |
*
* @param {Admin_Terminology_ResetInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_terminology_reset = /** @type {((inputs: Admin_Terminology_ResetInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Terminology_ResetInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_terminology_reset(inputs)
	if (locale === "en-XA") return en_xa2_admin_terminology_reset(inputs)
	return en_admin_terminology_reset(inputs)
});