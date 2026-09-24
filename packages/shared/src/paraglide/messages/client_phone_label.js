/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Client_Phone_LabelInputs */

const en_client_phone_label = /** @type {(inputs: Client_Phone_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Phone`)
};

const es_client_phone_label = /** @type {(inputs: Client_Phone_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Teléfono`)
};

const en_xa2_client_phone_label = /** @type {(inputs: Client_Phone_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Phònè ••⟧`)
};

/**
* | output |
* | --- |
* | "Phone" |
*
* @param {Client_Phone_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const client_phone_label = /** @type {((inputs?: Client_Phone_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Client_Phone_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_client_phone_label(inputs)
	if (locale === "en-XA") return en_xa2_client_phone_label(inputs)
	return en_client_phone_label(inputs)
});