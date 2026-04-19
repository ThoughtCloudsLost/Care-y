/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Mgr_Ops_No_QueuesInputs */

const en_mgr_ops_no_queues = /** @type {(inputs: Mgr_Ops_No_QueuesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No active queues`)
};

const es_mgr_ops_no_queues = /** @type {(inputs: Mgr_Ops_No_QueuesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sin colas activas`)
};

/**
* | output |
* | --- |
* | "No active queues" |
*
* @param {Mgr_Ops_No_QueuesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const mgr_ops_no_queues = /** @type {((inputs?: Mgr_Ops_No_QueuesInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Mgr_Ops_No_QueuesInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_mgr_ops_no_queues(inputs)
	return es_mgr_ops_no_queues(inputs)
});