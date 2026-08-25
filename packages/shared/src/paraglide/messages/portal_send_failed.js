/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Portal_Send_FailedInputs */

const en_portal_send_failed = /** @type {(inputs: Portal_Send_FailedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Your message did not send. Your words are back in the box. Tap send to try again.`)
};

const es_portal_send_failed = /** @type {(inputs: Portal_Send_FailedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tu mensaje no se envió. Tus palabras están de vuelta en el campo de texto. Toca enviar para intentarlo de nuevo.`)
};

/**
* | output |
* | --- |
* | "Your message did not send. Your words are back in the box. Tap send to try again." |
*
* @param {Portal_Send_FailedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_send_failed = /** @type {((inputs?: Portal_Send_FailedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Send_FailedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_portal_send_failed(inputs)
	return es_portal_send_failed(inputs)
});