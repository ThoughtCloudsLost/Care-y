/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Consultant_Phone_Number_LabelInputs */

const en_consultant_phone_number_label = /** @type {(inputs: Consultant_Phone_Number_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Phone number`)
};

const es_consultant_phone_number_label = /** @type {(inputs: Consultant_Phone_Number_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Número de teléfono`)
};

const en_xa2_consultant_phone_number_label = /** @type {(inputs: Consultant_Phone_Number_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Phònè nùmbèr ••••⟧`)
};

/**
* | output |
* | --- |
* | "Phone number" |
*
* @param {Consultant_Phone_Number_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const consultant_phone_number_label = /** @type {((inputs?: Consultant_Phone_Number_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Consultant_Phone_Number_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_consultant_phone_number_label(inputs)
	if (locale === "en-XA") return en_xa2_consultant_phone_number_label(inputs)
	return en_consultant_phone_number_label(inputs)
});