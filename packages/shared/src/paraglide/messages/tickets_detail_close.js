/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Tickets_Detail_CloseInputs */

const en_tickets_detail_close = /** @type {(inputs: Tickets_Detail_CloseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Close detail`)
};

const es_tickets_detail_close = /** @type {(inputs: Tickets_Detail_CloseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cerrar detalle`)
};

const en_xa2_tickets_detail_close = /** @type {(inputs: Tickets_Detail_CloseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Clòsè dètàìl ••••⟧`)
};

/**
* | output |
* | --- |
* | "Close detail" |
*
* @param {Tickets_Detail_CloseInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const tickets_detail_close = /** @type {((inputs?: Tickets_Detail_CloseInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_Detail_CloseInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_tickets_detail_close(inputs)
	if (locale === "en-XA") return en_xa2_tickets_detail_close(inputs)
	return en_tickets_detail_close(inputs)
});