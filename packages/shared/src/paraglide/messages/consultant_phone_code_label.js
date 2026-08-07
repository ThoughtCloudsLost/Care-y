/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Consultant_Phone_Code_LabelInputs */

const en_consultant_phone_code_label = /** @type {(inputs: Consultant_Phone_Code_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Verification code`)
};

const es_consultant_phone_code_label = /** @type {(inputs: Consultant_Phone_Code_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Codigo de verificacion`)
};

/**
* | output |
* | --- |
* | "Verification code" |
*
* @param {Consultant_Phone_Code_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const consultant_phone_code_label = /** @type {((inputs?: Consultant_Phone_Code_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Consultant_Phone_Code_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_consultant_phone_code_label(inputs)
	return es_consultant_phone_code_label(inputs)
});