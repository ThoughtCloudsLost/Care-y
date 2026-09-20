/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Portal_SendInputs */

const en_portal_send = /** @type {(inputs: Portal_SendInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Send`)
};

const es_portal_send = /** @type {(inputs: Portal_SendInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enviar`)
};

const en_xa2_portal_send = /** @type {(inputs: Portal_SendInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sènd ••⟧`)
};

/**
* | output |
* | --- |
* | "Send" |
*
* @param {Portal_SendInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const portal_send = /** @type {((inputs?: Portal_SendInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_SendInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_portal_send(inputs)
	if (locale === "en-XA") return en_xa2_portal_send(inputs)
	return en_portal_send(inputs)
});