/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Consultant_Phone_Status_UnverifiedInputs */

const en_consultant_phone_status_unverified = /** @type {(inputs: Consultant_Phone_Status_UnverifiedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Unverified`)
};

const es_consultant_phone_status_unverified = /** @type {(inputs: Consultant_Phone_Status_UnverifiedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sin verificar`)
};

const en_xa2_consultant_phone_status_unverified = /** @type {(inputs: Consultant_Phone_Status_UnverifiedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ùnvèrìfìèd •••⟧`)
};

/**
* | output |
* | --- |
* | "Unverified" |
*
* @param {Consultant_Phone_Status_UnverifiedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const consultant_phone_status_unverified = /** @type {((inputs?: Consultant_Phone_Status_UnverifiedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Consultant_Phone_Status_UnverifiedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_consultant_phone_status_unverified(inputs)
	if (locale === "en-XA") return en_xa2_consultant_phone_status_unverified(inputs)
	return en_consultant_phone_status_unverified(inputs)
});