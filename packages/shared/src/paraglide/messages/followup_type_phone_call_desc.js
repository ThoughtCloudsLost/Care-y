/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Followup_Type_Phone_Call_DescInputs */

const en_followup_type_phone_call_desc = /** @type {(inputs: Followup_Type_Phone_Call_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Inbound and outbound call records`)
};

const es_followup_type_phone_call_desc = /** @type {(inputs: Followup_Type_Phone_Call_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Registros de llamadas entrantes y salientes`)
};

/**
* | output |
* | --- |
* | "Inbound and outbound call records" |
*
* @param {Followup_Type_Phone_Call_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const followup_type_phone_call_desc = /** @type {((inputs?: Followup_Type_Phone_Call_DescInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Followup_Type_Phone_Call_DescInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_followup_type_phone_call_desc(inputs)
	return es_followup_type_phone_call_desc(inputs)
});