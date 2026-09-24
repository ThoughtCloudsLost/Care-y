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

const en_xa2_followup_type_phone_call_desc = /** @type {(inputs: Followup_Type_Phone_Call_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ìnbòùnd ànd òùtbòùnd càll rècòrds ••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Inbound and outbound call records" |
*
* @param {Followup_Type_Phone_Call_DescInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const followup_type_phone_call_desc = /** @type {((inputs?: Followup_Type_Phone_Call_DescInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Followup_Type_Phone_Call_DescInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_followup_type_phone_call_desc(inputs)
	if (locale === "en-XA") return en_xa2_followup_type_phone_call_desc(inputs)
	return en_followup_type_phone_call_desc(inputs)
});