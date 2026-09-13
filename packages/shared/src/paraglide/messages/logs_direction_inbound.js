/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Logs_Direction_InboundInputs */

const en_logs_direction_inbound = /** @type {(inputs: Logs_Direction_InboundInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Inbound`)
};

const es_logs_direction_inbound = /** @type {(inputs: Logs_Direction_InboundInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Entrante`)
};

/**
* | output |
* | --- |
* | "Inbound" |
*
* @param {Logs_Direction_InboundInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const logs_direction_inbound = /** @type {((inputs?: Logs_Direction_InboundInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Logs_Direction_InboundInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_logs_direction_inbound(inputs)
	return es_logs_direction_inbound(inputs)
});