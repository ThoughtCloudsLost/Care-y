/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Queues: NonNullable<unknown> }} Panel_QueuesInputs */

const en_panel_queues = /** @type {(inputs: Panel_QueuesInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Queues}`)
};

const es_panel_queues = /** @type {(inputs: Panel_QueuesInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Queues}`)
};

/**
* | output |
* | --- |
* | "{Queues}" |
*
* @param {Panel_QueuesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const panel_queues = /** @type {((inputs: Panel_QueuesInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Panel_QueuesInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_panel_queues(inputs)
	return es_panel_queues(inputs)
});