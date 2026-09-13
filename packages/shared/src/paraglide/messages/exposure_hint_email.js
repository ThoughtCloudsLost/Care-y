/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Exposure_Hint_EmailInputs */

const en_exposure_hint_email = /** @type {(inputs: Exposure_Hint_EmailInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Email is the easiest channel to fake. Anyone who controls the sender's mailbox, or pretends to, can send messages that look real. Verify anything important through another channel.`)
};

const es_exposure_hint_email = /** @type {(inputs: Exposure_Hint_EmailInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El correo electrónico es el canal más fácil de falsificar. Cualquier persona que controle el buzón del remitente, o finja hacerlo, puede enviar mensajes que parezcan reales. Verifica lo importante por otro canal.`)
};

/**
* | output |
* | --- |
* | "Email is the easiest channel to fake. Anyone who controls the sender's mailbox, or pretends to, can send messages that look real. Verify anything important t..." |
*
* @param {Exposure_Hint_EmailInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const exposure_hint_email = /** @type {((inputs?: Exposure_Hint_EmailInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Exposure_Hint_EmailInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_exposure_hint_email(inputs)
	return es_exposure_hint_email(inputs)
});