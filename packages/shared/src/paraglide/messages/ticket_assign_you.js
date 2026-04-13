/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Assign_YouInputs */

const en_ticket_assign_you = /** @type {(inputs: Ticket_Assign_YouInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`(you)`)
};

const es_ticket_assign_you = /** @type {(inputs: Ticket_Assign_YouInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`(tu)`)
};

/**
* | output |
* | --- |
* | "(you)" |
*
* @param {Ticket_Assign_YouInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_assign_you = /** @type {((inputs?: Ticket_Assign_YouInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Assign_YouInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_assign_you(inputs)
	return es_ticket_assign_you(inputs)
});