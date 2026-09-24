/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Tickets_Filter_AssigneeInputs */

const en_tickets_filter_assignee = /** @type {(inputs: Tickets_Filter_AssigneeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Assignee`)
};

const es_tickets_filter_assignee = /** @type {(inputs: Tickets_Filter_AssigneeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Asignado`)
};

const en_xa2_tickets_filter_assignee = /** @type {(inputs: Tickets_Filter_AssigneeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àssìgnèè •••⟧`)
};

/**
* | output |
* | --- |
* | "Assignee" |
*
* @param {Tickets_Filter_AssigneeInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const tickets_filter_assignee = /** @type {((inputs?: Tickets_Filter_AssigneeInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_Filter_AssigneeInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_tickets_filter_assignee(inputs)
	if (locale === "en-XA") return en_xa2_tickets_filter_assignee(inputs)
	return en_tickets_filter_assignee(inputs)
});