/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Terminology_Group_KbInputs */

const en_admin_terminology_group_kb = /** @type {(inputs: Admin_Terminology_Group_KbInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Reference library`)
};

const es_admin_terminology_group_kb = /** @type {(inputs: Admin_Terminology_Group_KbInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Biblioteca de referencia`)
};

const en_xa2_admin_terminology_group_kb = /** @type {(inputs: Admin_Terminology_Group_KbInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rèfèrèncè lìbràry ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Reference library" |
*
* @param {Admin_Terminology_Group_KbInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_terminology_group_kb = /** @type {((inputs?: Admin_Terminology_Group_KbInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Terminology_Group_KbInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_terminology_group_kb(inputs)
	if (locale === "en-XA") return en_xa2_admin_terminology_group_kb(inputs)
	return en_admin_terminology_group_kb(inputs)
});