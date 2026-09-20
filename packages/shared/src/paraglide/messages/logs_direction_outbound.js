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

const en_xa2_logs_direction_outbound = /** @type {(inputs: Logs_Direction_OutboundInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Òùtbòùnd •••⟧`)
};

/**
* | output |
* | --- |
* | "Outbound" |
*
* @param {Logs_Direction_OutboundInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const logs_direction_outbound = /** @type {((inputs?: Logs_Direction_OutboundInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Logs_Direction_OutboundInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_logs_direction_outbound(inputs)
	if (locale === "en-XA") return en_xa2_logs_direction_outbound(inputs)
	return en_logs_direction_outbound(inputs)
});