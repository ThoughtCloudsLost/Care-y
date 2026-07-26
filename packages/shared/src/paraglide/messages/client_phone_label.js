/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Client_Phone_LabelInputs */

const en_client_phone_label = /** @type {(inputs: Client_Phone_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Phone`)
};

const es_client_phone_label = /** @type {(inputs: Client_Phone_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Telefono`)
};

/**
* | output |
* | --- |
* | "Phone" |
*
* @param {Client_Phone_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const client_phone_label = /** @type {((inputs?: Client_Phone_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Client_Phone_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_client_phone_label(inputs)
	return es_client_phone_label(inputs)
});