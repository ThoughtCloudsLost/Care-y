/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Portal_Incomplete_LinkInputs */

const en_portal_incomplete_link = /** @type {(inputs: Portal_Incomplete_LinkInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This link is missing information. If you received it by text, open the full link from your message.`)
};

const es_portal_incomplete_link = /** @type {(inputs: Portal_Incomplete_LinkInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A este enlace le falta información. Si lo recibiste por mensaje de texto, abre el enlace completo desde tu mensaje.`)
};

/**
* | output |
* | --- |
* | "This link is missing information. If you received it by text, open the full link from your message." |
*
* @param {Portal_Incomplete_LinkInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_incomplete_link = /** @type {((inputs?: Portal_Incomplete_LinkInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Incomplete_LinkInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_portal_incomplete_link(inputs)
	return es_portal_incomplete_link(inputs)
});