/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Portal_Empty_ThreadInputs */

const en_portal_empty_thread = /** @type {(inputs: Portal_Empty_ThreadInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No messages yet. Your conversation will appear here.`)
};

const es_portal_empty_thread = /** @type {(inputs: Portal_Empty_ThreadInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Aún no hay mensajes. Tu conversación aparecerá aquí.`)
};

const en_xa2_portal_empty_thread = /** @type {(inputs: Portal_Empty_ThreadInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nò mèssàgès yèt. Yòùr cònvèrsàtìòn wìll àppèàr hèrè. ••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "No messages yet. Your conversation will appear here." |
*
* @param {Portal_Empty_ThreadInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const portal_empty_thread = /** @type {((inputs?: Portal_Empty_ThreadInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Empty_ThreadInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_portal_empty_thread(inputs)
	if (locale === "en-XA") return en_xa2_portal_empty_thread(inputs)
	return en_portal_empty_thread(inputs)
});