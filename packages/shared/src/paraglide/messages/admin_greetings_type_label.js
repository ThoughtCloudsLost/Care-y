/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Greetings_Type_LabelInputs */

const en_admin_greetings_type_label = /** @type {(inputs: Admin_Greetings_Type_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Type`)
};

const es_admin_greetings_type_label = /** @type {(inputs: Admin_Greetings_Type_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tipo`)
};

const en_xa2_admin_greetings_type_label = /** @type {(inputs: Admin_Greetings_Type_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Typè ••⟧`)
};

/**
* | output |
* | --- |
* | "Type" |
*
* @param {Admin_Greetings_Type_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_greetings_type_label = /** @type {((inputs?: Admin_Greetings_Type_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Greetings_Type_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_greetings_type_label(inputs)
	if (locale === "en-XA") return en_xa2_admin_greetings_type_label(inputs)
	return en_admin_greetings_type_label(inputs)
});