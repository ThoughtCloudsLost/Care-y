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

/**
* | output |
* | --- |
* | "Not set" |
*
* @param {Consultant_Phone_Status_NoneInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const consultant_phone_status_none = /** @type {((inputs?: Consultant_Phone_Status_NoneInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Consultant_Phone_Status_NoneInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_consultant_phone_status_none(inputs)
	return es_consultant_phone_status_none(inputs)
});