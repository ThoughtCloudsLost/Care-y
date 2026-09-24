/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Consultant_Phone_SendingInputs */

const en_consultant_phone_sending = /** @type {(inputs: Consultant_Phone_SendingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sending...`)
};

const es_consultant_phone_sending = /** @type {(inputs: Consultant_Phone_SendingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enviando...`)
};

const en_xa2_consultant_phone_sending = /** @type {(inputs: Consultant_Phone_SendingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sèndìng... •••⟧`)
};

/**
* | output |
* | --- |
* | "Sending..." |
*
* @param {Consultant_Phone_SendingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const consultant_phone_sending = /** @type {((inputs?: Consultant_Phone_SendingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Consultant_Phone_SendingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_consultant_phone_sending(inputs)
	if (locale === "en-XA") return en_xa2_consultant_phone_sending(inputs)
	return en_consultant_phone_sending(inputs)
});