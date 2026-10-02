/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Donation_Provider_UnavailableInputs */

const en_error_donation_provider_unavailable = /** @type {(inputs: Error_Donation_Provider_UnavailableInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The donation provider could not be reached. Try again in a minute.`)
};

const es_error_donation_provider_unavailable = /** @type {(inputs: Error_Donation_Provider_UnavailableInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No se pudo contactar con el proveedor de donaciones. Inténtalo de nuevo en un minuto.`)
};

const en_xa2_error_donation_provider_unavailable = /** @type {(inputs: Error_Donation_Provider_UnavailableInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè dònàtìòn pròvìdèr còùld nòt bè rèàchèd. Try àgàìn ìn à mìnùtè. ••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The donation provider could not be reached. Try again in a minute." |
*
* @param {Error_Donation_Provider_UnavailableInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_donation_provider_unavailable = /** @type {((inputs?: Error_Donation_Provider_UnavailableInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Donation_Provider_UnavailableInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_donation_provider_unavailable(inputs)
	if (locale === "en-XA") return en_xa2_error_donation_provider_unavailable(inputs)
	return en_error_donation_provider_unavailable(inputs)
});