/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Consultant_Phone_Code_PlaceholderInputs */

const en_consultant_phone_code_placeholder = /** @type {(inputs: Consultant_Phone_Code_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`000000`)
};

const es_consultant_phone_code_placeholder = /** @type {(inputs: Consultant_Phone_Code_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`000000`)
};

/**
* | output |
* | --- |
* | "000000" |
*
* @param {Consultant_Phone_Code_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const consultant_phone_code_placeholder = /** @type {((inputs?: Consultant_Phone_Code_PlaceholderInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Consultant_Phone_Code_PlaceholderInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_consultant_phone_code_placeholder(inputs)
	return es_consultant_phone_code_placeholder(inputs)
});