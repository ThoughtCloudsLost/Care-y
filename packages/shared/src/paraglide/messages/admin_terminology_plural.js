/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Terminology_PluralInputs */

const en_admin_terminology_plural = /** @type {(inputs: Admin_Terminology_PluralInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Plural`)
};

const es_admin_terminology_plural = /** @type {(inputs: Admin_Terminology_PluralInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Plural`)
};

const en_xa2_admin_terminology_plural = /** @type {(inputs: Admin_Terminology_PluralInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Plùràl ••⟧`)
};

/**
* | output |
* | --- |
* | "Plural" |
*
* @param {Admin_Terminology_PluralInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_terminology_plural = /** @type {((inputs?: Admin_Terminology_PluralInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Terminology_PluralInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_terminology_plural(inputs)
	if (locale === "en-XA") return en_xa2_admin_terminology_plural(inputs)
	return en_admin_terminology_plural(inputs)
});