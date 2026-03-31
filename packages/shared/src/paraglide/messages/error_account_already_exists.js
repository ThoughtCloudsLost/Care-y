/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Account_Already_ExistsInputs */

const en_error_account_already_exists = /** @type {(inputs: Error_Account_Already_ExistsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`An account with this username already exists.`)
};

const es_error_account_already_exists = /** @type {(inputs: Error_Account_Already_ExistsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ya existe una cuenta con este nombre de usuario.`)
};

/**
* | output |
* | --- |
* | "An account with this username already exists." |
*
* @param {Error_Account_Already_ExistsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_account_already_exists = /** @type {((inputs?: Error_Account_Already_ExistsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Account_Already_ExistsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_error_account_already_exists(inputs)
	return es_error_account_already_exists(inputs)
});