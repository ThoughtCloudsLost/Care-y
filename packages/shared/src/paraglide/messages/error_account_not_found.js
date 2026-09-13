/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Account_Not_FoundInputs */

const en_error_account_not_found = /** @type {(inputs: Error_Account_Not_FoundInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No account exists for this client.`)
};

const es_error_account_not_found = /** @type {(inputs: Error_Account_Not_FoundInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No existe una cuenta para este cliente.`)
};

/**
* | output |
* | --- |
* | "No account exists for this client." |
*
* @param {Error_Account_Not_FoundInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_account_not_found = /** @type {((inputs?: Error_Account_Not_FoundInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Account_Not_FoundInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_error_account_not_found(inputs)
	return es_error_account_not_found(inputs)
});