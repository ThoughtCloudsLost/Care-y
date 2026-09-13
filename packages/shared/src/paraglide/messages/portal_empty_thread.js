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

/**
* | output |
* | --- |
* | "No messages yet. Your conversation will appear here." |
*
* @param {Portal_Empty_ThreadInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_empty_thread = /** @type {((inputs?: Portal_Empty_ThreadInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Empty_ThreadInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_portal_empty_thread(inputs)
	return es_portal_empty_thread(inputs)
});