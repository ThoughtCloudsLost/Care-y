/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Terminology_Suggestions_LabelInputs */

const en_admin_terminology_suggestions_label = /** @type {(inputs: Admin_Terminology_Suggestions_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Suggestions`)
};

const es_admin_terminology_suggestions_label = /** @type {(inputs: Admin_Terminology_Suggestions_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sugerencias`)
};

/**
* | output |
* | --- |
* | "Suggestions" |
*
* @param {Admin_Terminology_Suggestions_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_terminology_suggestions_label = /** @type {((inputs?: Admin_Terminology_Suggestions_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Terminology_Suggestions_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_terminology_suggestions_label(inputs)
	return es_admin_terminology_suggestions_label(inputs)
});