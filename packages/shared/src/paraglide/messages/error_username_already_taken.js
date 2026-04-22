/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Username_Already_TakenInputs */

const en_error_username_already_taken = /** @type {(inputs: Error_Username_Already_TakenInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This username is already taken.`)
};

const es_error_username_already_taken = /** @type {(inputs: Error_Username_Already_TakenInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Este usuario ya esta en uso.`)
};

/**
* | output |
* | --- |
* | "This username is already taken." |
*
* @param {Error_Username_Already_TakenInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_username_already_taken = /** @type {((inputs?: Error_Username_Already_TakenInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Username_Already_TakenInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_error_username_already_taken(inputs)
	return es_error_username_already_taken(inputs)
});