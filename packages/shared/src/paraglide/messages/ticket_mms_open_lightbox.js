/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Mms_Open_LightboxInputs */

const en_ticket_mms_open_lightbox = /** @type {(inputs: Ticket_Mms_Open_LightboxInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`View full-size image`)
};

const es_ticket_mms_open_lightbox = /** @type {(inputs: Ticket_Mms_Open_LightboxInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ver imagen en tamaño completo`)
};

/**
* | output |
* | --- |
* | "View full-size image" |
*
* @param {Ticket_Mms_Open_LightboxInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_mms_open_lightbox = /** @type {((inputs?: Ticket_Mms_Open_LightboxInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Mms_Open_LightboxInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_mms_open_lightbox(inputs)
	return es_ticket_mms_open_lightbox(inputs)
});