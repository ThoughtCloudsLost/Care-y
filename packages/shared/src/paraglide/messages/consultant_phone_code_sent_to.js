/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ tail: NonNullable<unknown> }} Consultant_Phone_Code_Sent_ToInputs */

const en_consultant_phone_code_sent_to = /** @type {(inputs: Consultant_Phone_Code_Sent_ToInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`We texted a code to ***${i?.tail}`)
};

const es_consultant_phone_code_sent_to = /** @type {(inputs: Consultant_Phone_Code_Sent_ToInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Enviamos un codigo a ***${i?.tail}`)
};

/**
* | output |
* | --- |
* | "We texted a code to ***{tail}" |
*
* @param {Consultant_Phone_Code_Sent_ToInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const consultant_phone_code_sent_to = /** @type {((inputs: Consultant_Phone_Code_Sent_ToInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Consultant_Phone_Code_Sent_ToInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_consultant_phone_code_sent_to(inputs)
	return es_consultant_phone_code_sent_to(inputs)
});