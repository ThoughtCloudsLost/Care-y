/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Donation_Provider_RejectedInputs */

const en_error_donation_provider_rejected = /** @type {(inputs: Error_Donation_Provider_RejectedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The donation provider refused the API key. Check the key and try again.`)
};

const es_error_donation_provider_rejected = /** @type {(inputs: Error_Donation_Provider_RejectedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El proveedor de donaciones rechazó la clave de API. Revisa la clave e inténtalo de nuevo.`)
};

const en_xa2_error_donation_provider_rejected = /** @type {(inputs: Error_Donation_Provider_RejectedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè dònàtìòn pròvìdèr rèfùsèd thè ÀPÌ kèy. Chèck thè kèy ànd try àgàìn. ••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The donation provider refused the API key. Check the key and try again." |
*
* @param {Error_Donation_Provider_RejectedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_donation_provider_rejected = /** @type {((inputs?: Error_Donation_Provider_RejectedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Donation_Provider_RejectedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_donation_provider_rejected(inputs)
	if (locale === "en-XA") return en_xa2_error_donation_provider_rejected(inputs)
	return en_error_donation_provider_rejected(inputs)
});