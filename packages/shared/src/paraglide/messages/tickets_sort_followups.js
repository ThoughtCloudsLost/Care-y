/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Tickets_Sort_FollowupsInputs */

const en_tickets_sort_followups = /** @type {(inputs: Tickets_Sort_FollowupsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Most follow-ups`)
};

const es_tickets_sort_followups = /** @type {(inputs: Tickets_Sort_FollowupsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Más seguimientos`)
};

const en_xa2_tickets_sort_followups = /** @type {(inputs: Tickets_Sort_FollowupsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Mòst fòllòw-ùps •••••⟧`)
};

/**
* | output |
* | --- |
* | "Most follow-ups" |
*
* @param {Tickets_Sort_FollowupsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const tickets_sort_followups = /** @type {((inputs?: Tickets_Sort_FollowupsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_Sort_FollowupsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_tickets_sort_followups(inputs)
	if (locale === "en-XA") return en_xa2_tickets_sort_followups(inputs)
	return en_tickets_sort_followups(inputs)
});