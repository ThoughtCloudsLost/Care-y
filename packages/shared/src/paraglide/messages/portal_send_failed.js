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

const en_xa2_portal_send_failed = /** @type {(inputs: Portal_Send_FailedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Yòùr mèssàgè dìd nòt sènd. Yòùr wòrds àrè bàck ìn thè bòx. Tàp sènd tò try àgàìn. •••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Your message did not send. Your words are back in the box. Tap send to try again." |
*
* @param {Portal_Send_FailedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const portal_send_failed = /** @type {((inputs?: Portal_Send_FailedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Send_FailedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_portal_send_failed(inputs)
	if (locale === "en-XA") return en_xa2_portal_send_failed(inputs)
	return en_portal_send_failed(inputs)
});