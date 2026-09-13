/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Logs_Direction_OutboundInputs */

const en_logs_direction_outbound = /** @type {(inputs: Logs_Direction_OutboundInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Outbound`)
};

const es_logs_direction_outbound = /** @type {(inputs: Logs_Direction_OutboundInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Saliente`)
};

/**
* | output |
* | --- |
* | "Outbound" |
*
* @param {Logs_Direction_OutboundInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const logs_direction_outbound = /** @type {((inputs?: Logs_Direction_OutboundInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Logs_Direction_OutboundInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_logs_direction_outbound(inputs)
	return es_logs_direction_outbound(inputs)
});