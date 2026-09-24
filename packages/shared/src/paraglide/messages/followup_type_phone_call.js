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

const en_xa2_followup_type_phone_call = /** @type {(inputs: Followup_Type_Phone_CallInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Phònè Càlls ••••⟧`)
};

/**
* | output |
* | --- |
* | "Phone Calls" |
*
* @param {Followup_Type_Phone_CallInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const followup_type_phone_call = /** @type {((inputs?: Followup_Type_Phone_CallInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Followup_Type_Phone_CallInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_followup_type_phone_call(inputs)
	if (locale === "en-XA") return en_xa2_followup_type_phone_call(inputs)
	return en_followup_type_phone_call(inputs)
});