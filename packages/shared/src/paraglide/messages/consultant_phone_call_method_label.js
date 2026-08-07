/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Consultant_Phone_Call_Method_LabelInputs */

const en_consultant_phone_call_method_label = /** @type {(inputs: Consultant_Phone_Call_Method_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Call method`)
};

const es_consultant_phone_call_method_label = /** @type {(inputs: Consultant_Phone_Call_Method_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Metodo de llamada`)
};

/**
* | output |
* | --- |
* | "Call method" |
*
* @param {Consultant_Phone_Call_Method_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const consultant_phone_call_method_label = /** @type {((inputs?: Consultant_Phone_Call_Method_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Consultant_Phone_Call_Method_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_consultant_phone_call_method_label(inputs)
	return es_consultant_phone_call_method_label(inputs)
});