/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Consultant_Phone_Call_Method_CallbackInputs */

const en_consultant_phone_call_method_callback = /** @type {(inputs: Consultant_Phone_Call_Method_CallbackInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Phone callback`)
};

const es_consultant_phone_call_method_callback = /** @type {(inputs: Consultant_Phone_Call_Method_CallbackInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Devolución de llamada`)
};

const en_xa2_consultant_phone_call_method_callback = /** @type {(inputs: Consultant_Phone_Call_Method_CallbackInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Phònè càllbàck •••••⟧`)
};

/**
* | output |
* | --- |
* | "Phone callback" |
*
* @param {Consultant_Phone_Call_Method_CallbackInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const consultant_phone_call_method_callback = /** @type {((inputs?: Consultant_Phone_Call_Method_CallbackInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Consultant_Phone_Call_Method_CallbackInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_consultant_phone_call_method_callback(inputs)
	if (locale === "en-XA") return en_xa2_consultant_phone_call_method_callback(inputs)
	return en_consultant_phone_call_method_callback(inputs)
});