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

/**
* | output |
* | --- |
* | "Unverified" |
*
* @param {Consultant_Phone_Status_UnverifiedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const consultant_phone_status_unverified = /** @type {((inputs?: Consultant_Phone_Status_UnverifiedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Consultant_Phone_Status_UnverifiedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_consultant_phone_status_unverified(inputs)
	return es_consultant_phone_status_unverified(inputs)
});