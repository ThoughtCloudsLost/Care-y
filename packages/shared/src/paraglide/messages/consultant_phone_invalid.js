/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Consultant_Phone_InvalidInputs */

const en_consultant_phone_invalid = /** @type {(inputs: Consultant_Phone_InvalidInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enter a number like +1 555 000 1234`)
};

const es_consultant_phone_invalid = /** @type {(inputs: Consultant_Phone_InvalidInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ingresa un numero como +1 555 000 1234`)
};

/**
* | output |
* | --- |
* | "Enter a number like +1 555 000 1234" |
*
* @param {Consultant_Phone_InvalidInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const consultant_phone_invalid = /** @type {((inputs?: Consultant_Phone_InvalidInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Consultant_Phone_InvalidInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_consultant_phone_invalid(inputs)
	return es_consultant_phone_invalid(inputs)
});