/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Call_Status_BusyInputs */

const en_call_status_busy = /** @type {(inputs: Call_Status_BusyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Busy`)
};

const es_call_status_busy = /** @type {(inputs: Call_Status_BusyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ocupado`)
};

const en_xa2_call_status_busy = /** @type {(inputs: Call_Status_BusyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Bùsy ••⟧`)
};

/**
* | output |
* | --- |
* | "Busy" |
*
* @param {Call_Status_BusyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const call_status_busy = /** @type {((inputs?: Call_Status_BusyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Call_Status_BusyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_call_status_busy(inputs)
	if (locale === "en-XA") return en_xa2_call_status_busy(inputs)
	return en_call_status_busy(inputs)
});