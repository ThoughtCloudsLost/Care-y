/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Phone_Shared_Line_LabelInputs */

const en_phone_shared_line_label = /** @type {(inputs: Phone_Shared_Line_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Shared line`)
};

const es_phone_shared_line_label = /** @type {(inputs: Phone_Shared_Line_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Línea compartida`)
};

const en_xa2_phone_shared_line_label = /** @type {(inputs: Phone_Shared_Line_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Shàrèd lìnè ••••⟧`)
};

/**
* | output |
* | --- |
* | "Shared line" |
*
* @param {Phone_Shared_Line_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const phone_shared_line_label = /** @type {((inputs?: Phone_Shared_Line_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Phone_Shared_Line_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_phone_shared_line_label(inputs)
	if (locale === "en-XA") return en_xa2_phone_shared_line_label(inputs)
	return en_phone_shared_line_label(inputs)
});