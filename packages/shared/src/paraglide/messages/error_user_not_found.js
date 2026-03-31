/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_User_Not_FoundInputs */

const en_error_user_not_found = /** @type {(inputs: Error_User_Not_FoundInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`User not found.`)
};

const es_error_user_not_found = /** @type {(inputs: Error_User_Not_FoundInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Usuario no encontrado.`)
};

/**
* | output |
* | --- |
* | "User not found." |
*
* @param {Error_User_Not_FoundInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_user_not_found = /** @type {((inputs?: Error_User_Not_FoundInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_User_Not_FoundInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_error_user_not_found(inputs)
	return es_error_user_not_found(inputs)
});