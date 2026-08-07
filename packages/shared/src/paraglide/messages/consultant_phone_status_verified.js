/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Consultant_Phone_Status_VerifiedInputs */

const en_consultant_phone_status_verified = /** @type {(inputs: Consultant_Phone_Status_VerifiedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Verified`)
};

const es_consultant_phone_status_verified = /** @type {(inputs: Consultant_Phone_Status_VerifiedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Verificado`)
};

/**
* | output |
* | --- |
* | "Verified" |
*
* @param {Consultant_Phone_Status_VerifiedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const consultant_phone_status_verified = /** @type {((inputs?: Consultant_Phone_Status_VerifiedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Consultant_Phone_Status_VerifiedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_consultant_phone_status_verified(inputs)
	return es_consultant_phone_status_verified(inputs)
});