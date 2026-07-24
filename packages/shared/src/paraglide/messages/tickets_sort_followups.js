/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Tickets_Sort_FollowupsInputs */

const en_tickets_sort_followups = /** @type {(inputs: Tickets_Sort_FollowupsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Most follow-ups`)
};

const es_tickets_sort_followups = /** @type {(inputs: Tickets_Sort_FollowupsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Mas seguimientos`)
};

/**
* | output |
* | --- |
* | "Most follow-ups" |
*
* @param {Tickets_Sort_FollowupsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const tickets_sort_followups = /** @type {((inputs?: Tickets_Sort_FollowupsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_Sort_FollowupsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_tickets_sort_followups(inputs)
	return es_tickets_sort_followups(inputs)
});