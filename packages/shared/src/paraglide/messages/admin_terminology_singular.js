/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Terminology_SingularInputs */

const en_admin_terminology_singular = /** @type {(inputs: Admin_Terminology_SingularInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Singular`)
};

const es_admin_terminology_singular = /** @type {(inputs: Admin_Terminology_SingularInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Singular`)
};

/**
* | output |
* | --- |
* | "Singular" |
*
* @param {Admin_Terminology_SingularInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_terminology_singular = /** @type {((inputs?: Admin_Terminology_SingularInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Terminology_SingularInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_terminology_singular(inputs)
	return es_admin_terminology_singular(inputs)
});