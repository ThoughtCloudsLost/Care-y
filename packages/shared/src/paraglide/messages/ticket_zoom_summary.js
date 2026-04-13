/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown>, days: NonNullable<unknown>, recency: NonNullable<unknown> }} Ticket_Zoom_SummaryInputs */

const en_ticket_zoom_summary = /** @type {(inputs: Ticket_Zoom_SummaryInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} messages over ${i?.days} days, most recent ${i?.recency}`)
};

const es_ticket_zoom_summary = /** @type {(inputs: Ticket_Zoom_SummaryInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} mensajes en ${i?.days} dias, mas reciente ${i?.recency}`)
};

/**
* | output |
* | --- |
* | "{count} messages over {days} days, most recent {recency}" |
*
* @param {Ticket_Zoom_SummaryInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_zoom_summary = /** @type {((inputs: Ticket_Zoom_SummaryInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Zoom_SummaryInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_zoom_summary(inputs)
	return es_ticket_zoom_summary(inputs)
});