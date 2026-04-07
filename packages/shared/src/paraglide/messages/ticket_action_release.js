/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Action_ReleaseInputs */

const en_ticket_action_release = /** @type {(inputs: Ticket_Action_ReleaseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Release`)
};

const es_ticket_action_release = /** @type {(inputs: Ticket_Action_ReleaseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Liberar`)
};

/**
* | output |
* | --- |
* | "Release" |
*
* @param {Ticket_Action_ReleaseInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_action_release = /** @type {((inputs?: Ticket_Action_ReleaseInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Action_ReleaseInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_action_release(inputs)
	return es_ticket_action_release(inputs)
});