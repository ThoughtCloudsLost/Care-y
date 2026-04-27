/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Followup_Type_Phone_CallInputs */

const en_followup_type_phone_call = /** @type {(inputs: Followup_Type_Phone_CallInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Phone Calls`)
};

const es_followup_type_phone_call = /** @type {(inputs: Followup_Type_Phone_CallInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Llamadas`)
};

/**
* | output |
* | --- |
* | "Phone Calls" |
*
* @param {Followup_Type_Phone_CallInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const followup_type_phone_call = /** @type {((inputs?: Followup_Type_Phone_CallInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Followup_Type_Phone_CallInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_followup_type_phone_call(inputs)
	return es_followup_type_phone_call(inputs)
});