/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ tail: NonNullable<unknown> }} Consultant_Phone_Verified_TailInputs */

const en_consultant_phone_verified_tail = /** @type {(inputs: Consultant_Phone_Verified_TailInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`***${i?.tail}`)
};

const es_consultant_phone_verified_tail = /** @type {(inputs: Consultant_Phone_Verified_TailInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`***${i?.tail}`)
};

const en_xa2_consultant_phone_verified_tail = /** @type {(inputs: Consultant_Phone_Verified_TailInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦*** •${i?.tail}⟧`)
};

/**
* | output |
* | --- |
* | "***{tail}" |
*
* @param {Consultant_Phone_Verified_TailInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const consultant_phone_verified_tail = /** @type {((inputs: Consultant_Phone_Verified_TailInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Consultant_Phone_Verified_TailInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_consultant_phone_verified_tail(inputs)
	if (locale === "en-XA") return en_xa2_consultant_phone_verified_tail(inputs)
	return en_consultant_phone_verified_tail(inputs)
});