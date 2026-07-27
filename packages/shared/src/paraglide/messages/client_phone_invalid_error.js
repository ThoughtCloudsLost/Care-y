/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Client_Phone_Invalid_ErrorInputs */

const en_client_phone_invalid_error = /** @type {(inputs: Client_Phone_Invalid_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enter a number like +1 555 000 1234`)
};

const es_client_phone_invalid_error = /** @type {(inputs: Client_Phone_Invalid_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Introduce un numero como +1 555 000 1234`)
};

/**
* | output |
* | --- |
* | "Enter a number like +1 555 000 1234" |
*
* @param {Client_Phone_Invalid_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const client_phone_invalid_error = /** @type {((inputs?: Client_Phone_Invalid_ErrorInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Client_Phone_Invalid_ErrorInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_client_phone_invalid_error(inputs)
	return es_client_phone_invalid_error(inputs)
});