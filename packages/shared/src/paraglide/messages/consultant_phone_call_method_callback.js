/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Consultant_Phone_Call_Method_CallbackInputs */

const en_consultant_phone_call_method_callback = /** @type {(inputs: Consultant_Phone_Call_Method_CallbackInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Phone callback`)
};

const es_consultant_phone_call_method_callback = /** @type {(inputs: Consultant_Phone_Call_Method_CallbackInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Devolucion de llamada`)
};

/**
* | output |
* | --- |
* | "Phone callback" |
*
* @param {Consultant_Phone_Call_Method_CallbackInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const consultant_phone_call_method_callback = /** @type {((inputs?: Consultant_Phone_Call_Method_CallbackInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Consultant_Phone_Call_Method_CallbackInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_consultant_phone_call_method_callback(inputs)
	return es_consultant_phone_call_method_callback(inputs)
});