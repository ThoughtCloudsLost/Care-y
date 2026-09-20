/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Account_Already_ExistsInputs */

const en_error_account_already_exists = /** @type {(inputs: Error_Account_Already_ExistsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`An account with this login username already exists.`)
};

const es_error_account_already_exists = /** @type {(inputs: Error_Account_Already_ExistsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ya existe una cuenta con este usuario de inicio de sesión.`)
};

const en_xa2_error_account_already_exists = /** @type {(inputs: Error_Account_Already_ExistsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àn àccòùnt wìth thìs lògìn ùsèrnàmè àlrèàdy èxìsts. ••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "An account with this login username already exists." |
*
* @param {Error_Account_Already_ExistsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_account_already_exists = /** @type {((inputs?: Error_Account_Already_ExistsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Account_Already_ExistsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_account_already_exists(inputs)
	if (locale === "en-XA") return en_xa2_error_account_already_exists(inputs)
	return en_error_account_already_exists(inputs)
});