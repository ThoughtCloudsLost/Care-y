/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Consultant_Phone_Status_NoneInputs */

const en_consultant_phone_status_none = /** @type {(inputs: Consultant_Phone_Status_NoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Not set`)
};

const es_consultant_phone_status_none = /** @type {(inputs: Consultant_Phone_Status_NoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sin configurar`)
};

const en_xa2_consultant_phone_status_none = /** @type {(inputs: Consultant_Phone_Status_NoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nòt sèt •••⟧`)
};

/**
* | output |
* | --- |
* | "Not set" |
*
* @param {Consultant_Phone_Status_NoneInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const consultant_phone_status_none = /** @type {((inputs?: Consultant_Phone_Status_NoneInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Consultant_Phone_Status_NoneInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_consultant_phone_status_none(inputs)
	if (locale === "en-XA") return en_xa2_consultant_phone_status_none(inputs)
	return en_consultant_phone_status_none(inputs)
});