/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Tickets_Filter_AssigneeInputs */

const en_tickets_filter_assignee = /** @type {(inputs: Tickets_Filter_AssigneeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Assignee`)
};

/** @type {(inputs: Tickets_Filter_AssigneeInputs) => LocalizedString} */
const es_tickets_filter_assignee = en_tickets_filter_assignee;

/**
* | output |
* | --- |
* | "Assignee" |
*
* @param {Tickets_Filter_AssigneeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const tickets_filter_assignee = /** @type {((inputs?: Tickets_Filter_AssigneeInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_Filter_AssigneeInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_tickets_filter_assignee(inputs)
	return es_tickets_filter_assignee(inputs)
});