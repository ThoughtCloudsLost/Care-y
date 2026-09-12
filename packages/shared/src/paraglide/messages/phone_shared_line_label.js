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

/**
* | output |
* | --- |
* | "Shared line" |
*
* @param {Phone_Shared_Line_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const phone_shared_line_label = /** @type {((inputs?: Phone_Shared_Line_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Phone_Shared_Line_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_phone_shared_line_label(inputs)
	return es_phone_shared_line_label(inputs)
});