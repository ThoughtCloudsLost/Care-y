/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Client_Phone_Invalid_ErrorInputs */

const en_client_phone_invalid_error = /** @type {(inputs: Client_Phone_Invalid_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enter a number like +1 555 000 1234`)
};

const es_client_phone_invalid_error = /** @type {(inputs: Client_Phone_Invalid_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Introduce un número como +1 555 000 1234`)
};

const en_xa2_client_phone_invalid_error = /** @type {(inputs: Client_Phone_Invalid_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èntèr à nùmbèr lìkè +1 555 000 1234 •••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Enter a number like +1 555 000 1234" |
*
* @param {Client_Phone_Invalid_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const client_phone_invalid_error = /** @type {((inputs?: Client_Phone_Invalid_ErrorInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Client_Phone_Invalid_ErrorInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_client_phone_invalid_error(inputs)
	if (locale === "en-XA") return en_xa2_client_phone_invalid_error(inputs)
	return en_client_phone_invalid_error(inputs)
});