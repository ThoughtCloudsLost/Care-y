/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Consultant_Phone_Number_PlaceholderInputs */

const en_consultant_phone_number_placeholder = /** @type {(inputs: Consultant_Phone_Number_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`+1 555 000 1234`)
};

const es_consultant_phone_number_placeholder = /** @type {(inputs: Consultant_Phone_Number_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`+1 555 000 1234`)
};

/**
* | output |
* | --- |
* | "+1 555 000 1234" |
*
* @param {Consultant_Phone_Number_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const consultant_phone_number_placeholder = /** @type {((inputs?: Consultant_Phone_Number_PlaceholderInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Consultant_Phone_Number_PlaceholderInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_consultant_phone_number_placeholder(inputs)
	return es_consultant_phone_number_placeholder(inputs)
});