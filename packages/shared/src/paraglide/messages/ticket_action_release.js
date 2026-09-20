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

const en_xa2_ticket_action_release = /** @type {(inputs: Ticket_Action_ReleaseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rèlèàsè •••⟧`)
};

/**
* | output |
* | --- |
* | "Release" |
*
* @param {Ticket_Action_ReleaseInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_action_release = /** @type {((inputs?: Ticket_Action_ReleaseInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Action_ReleaseInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_action_release(inputs)
	if (locale === "en-XA") return en_xa2_ticket_action_release(inputs)
	return en_ticket_action_release(inputs)
});