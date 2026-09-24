/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Tickets_SelectedInputs */

const en_tickets_selected = /** @type {(inputs: Tickets_SelectedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} selected`)
};

const es_tickets_selected = /** @type {(inputs: Tickets_SelectedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} seleccionados`)
};

const en_xa2_tickets_selected = /** @type {(inputs: Tickets_SelectedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.count} sèlèctèd •••⟧`)
};

/**
* | output |
* | --- |
* | "{count} selected" |
*
* @param {Tickets_SelectedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const tickets_selected = /** @type {((inputs: Tickets_SelectedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_SelectedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_tickets_selected(inputs)
	if (locale === "en-XA") return en_xa2_tickets_selected(inputs)
	return en_tickets_selected(inputs)
});