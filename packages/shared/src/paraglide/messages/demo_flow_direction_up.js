/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Flow_Direction_UpInputs */

const en_demo_flow_direction_up = /** @type {(inputs: Demo_Flow_Direction_UpInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Request`)
};

const es_demo_flow_direction_up = /** @type {(inputs: Demo_Flow_Direction_UpInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Solicitud`)
};

const en_xa2_demo_flow_direction_up = /** @type {(inputs: Demo_Flow_Direction_UpInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rèqùèst •••⟧`)
};

/**
* | output |
* | --- |
* | "Request" |
*
* @param {Demo_Flow_Direction_UpInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_flow_direction_up = /** @type {((inputs?: Demo_Flow_Direction_UpInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Flow_Direction_UpInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_flow_direction_up(inputs)
	if (locale === "en-XA") return en_xa2_demo_flow_direction_up(inputs)
	return en_demo_flow_direction_up(inputs)
});