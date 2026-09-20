/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Portal_Web_Chat_HintInputs */

const en_portal_web_chat_hint = /** @type {(inputs: Portal_Web_Chat_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Your messages are encrypted before they leave your device. Only your organization can read them, and once a volunteer picks up your case, only the volunteers helping you.`)
};

const es_portal_web_chat_hint = /** @type {(inputs: Portal_Web_Chat_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tus mensajes se cifran antes de salir de tu dispositivo. Solo tu organización puede leerlos, y una vez que un voluntario toma tu caso, solo los voluntarios que te ayudan.`)
};

/**
* | output |
* | --- |
* | "Your messages are encrypted before they leave your device. Only your organization can read them, and once a volunteer picks up your case, only the volunteers..." |
*
* @param {Portal_Web_Chat_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_web_chat_hint = /** @type {((inputs?: Portal_Web_Chat_HintInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Web_Chat_HintInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_portal_web_chat_hint(inputs)
	return en_portal_web_chat_hint(inputs)
});