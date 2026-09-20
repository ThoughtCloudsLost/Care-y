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

const en_xa2_consultant_phone_call_method_label = /** @type {(inputs: Consultant_Phone_Call_Method_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Càll mèthòd ••••⟧`)
};

/**
* | output |
* | --- |
* | "Call method" |
*
* @param {Consultant_Phone_Call_Method_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const consultant_phone_call_method_label = /** @type {((inputs?: Consultant_Phone_Call_Method_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Consultant_Phone_Call_Method_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_consultant_phone_call_method_label(inputs)
	if (locale === "en-XA") return en_xa2_consultant_phone_call_method_label(inputs)
	return en_consultant_phone_call_method_label(inputs)
});