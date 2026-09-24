/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Mms_LoadingInputs */

const en_ticket_mms_loading = /** @type {(inputs: Ticket_Mms_LoadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Loading image...`)
};

const es_ticket_mms_loading = /** @type {(inputs: Ticket_Mms_LoadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cargando imagen...`)
};

const en_xa2_ticket_mms_loading = /** @type {(inputs: Ticket_Mms_LoadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Lòàdìng ìmàgè... •••••⟧`)
};

/**
* | output |
* | --- |
* | "Loading image..." |
*
* @param {Ticket_Mms_LoadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_mms_loading = /** @type {((inputs?: Ticket_Mms_LoadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Mms_LoadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_mms_loading(inputs)
	if (locale === "en-XA") return en_xa2_ticket_mms_loading(inputs)
	return en_ticket_mms_loading(inputs)
});