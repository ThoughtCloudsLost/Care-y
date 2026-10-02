/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Donation_Connection_Not_FoundInputs */

const en_error_donation_connection_not_found = /** @type {(inputs: Error_Donation_Connection_Not_FoundInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`That donation provider connection no longer exists.`)
};

const es_error_donation_connection_not_found = /** @type {(inputs: Error_Donation_Connection_Not_FoundInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Esa conexión con el proveedor de donaciones ya no existe.`)
};

const en_xa2_error_donation_connection_not_found = /** @type {(inputs: Error_Donation_Connection_Not_FoundInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thàt dònàtìòn pròvìdèr cònnèctìòn nò lòngèr èxìsts. ••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "That donation provider connection no longer exists." |
*
* @param {Error_Donation_Connection_Not_FoundInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_donation_connection_not_found = /** @type {((inputs?: Error_Donation_Connection_Not_FoundInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Donation_Connection_Not_FoundInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_donation_connection_not_found(inputs)
	if (locale === "en-XA") return en_xa2_error_donation_connection_not_found(inputs)
	return en_error_donation_connection_not_found(inputs)
});