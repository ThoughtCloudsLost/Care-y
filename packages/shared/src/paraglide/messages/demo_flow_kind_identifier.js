/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Flow_Kind_IdentifierInputs */

const en_demo_flow_kind_identifier = /** @type {(inputs: Demo_Flow_Kind_IdentifierInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Identifier`)
};

const es_demo_flow_kind_identifier = /** @type {(inputs: Demo_Flow_Kind_IdentifierInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Identificador`)
};

/**
* | output |
* | --- |
* | "Identifier" |
*
* @param {Demo_Flow_Kind_IdentifierInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_flow_kind_identifier = /** @type {((inputs?: Demo_Flow_Kind_IdentifierInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Flow_Kind_IdentifierInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_flow_kind_identifier(inputs)
	return es_demo_flow_kind_identifier(inputs)
});