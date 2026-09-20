/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Logs_Call_Status_BusyInputs */

const en_logs_call_status_busy = /** @type {(inputs: Logs_Call_Status_BusyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Busy`)
};

const es_logs_call_status_busy = /** @type {(inputs: Logs_Call_Status_BusyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ocupado`)
};

const en_xa2_logs_call_status_busy = /** @type {(inputs: Logs_Call_Status_BusyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Bùsy ••⟧`)
};

/**
* | output |
* | --- |
* | "Busy" |
*
* @param {Logs_Call_Status_BusyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const logs_call_status_busy = /** @type {((inputs?: Logs_Call_Status_BusyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Logs_Call_Status_BusyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_logs_call_status_busy(inputs)
	if (locale === "en-XA") return en_xa2_logs_call_status_busy(inputs)
	return en_logs_call_status_busy(inputs)
});