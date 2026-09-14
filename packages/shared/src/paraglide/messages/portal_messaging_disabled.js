/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Portal_Messaging_DisabledInputs */

const en_portal_messaging_disabled = /** @type {(inputs: Portal_Messaging_DisabledInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Messaging is currently unavailable for this support line.`)
};

const es_portal_messaging_disabled = /** @type {(inputs: Portal_Messaging_DisabledInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La mensajería no está disponible en este momento para esta línea de soporte.`)
};

/**
* | output |
* | --- |
* | "Messaging is currently unavailable for this support line." |
*
* @param {Portal_Messaging_DisabledInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_messaging_disabled = /** @type {((inputs?: Portal_Messaging_DisabledInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Messaging_DisabledInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_portal_messaging_disabled(inputs)
	return en_portal_messaging_disabled(inputs)
});