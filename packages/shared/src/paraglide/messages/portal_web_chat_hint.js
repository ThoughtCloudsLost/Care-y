/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Portal_Web_Chat_HintInputs */

const en_portal_web_chat_hint = /** @type {(inputs: Portal_Web_Chat_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Your messages are encrypted before they leave your device. Only assigned volunteers can read them.`)
};

const es_portal_web_chat_hint = /** @type {(inputs: Portal_Web_Chat_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tus mensajes se cifran antes de salir de tu dispositivo. Solo los voluntarios asignados pueden leerlos.`)
};

/**
* | output |
* | --- |
* | "Your messages are encrypted before they leave your device. Only assigned volunteers can read them." |
*
* @param {Portal_Web_Chat_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_web_chat_hint = /** @type {((inputs?: Portal_Web_Chat_HintInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Web_Chat_HintInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_portal_web_chat_hint(inputs)
	return es_portal_web_chat_hint(inputs)
});