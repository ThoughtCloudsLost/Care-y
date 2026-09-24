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

const en_xa2_demo_flow_kind_identifier = /** @type {(inputs: Demo_Flow_Kind_IdentifierInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ìdèntìfìèr •••⟧`)
};

/**
* | output |
* | --- |
* | "Identifier" |
*
* @param {Demo_Flow_Kind_IdentifierInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_flow_kind_identifier = /** @type {((inputs?: Demo_Flow_Kind_IdentifierInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Flow_Kind_IdentifierInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_flow_kind_identifier(inputs)
	if (locale === "en-XA") return en_xa2_demo_flow_kind_identifier(inputs)
	return en_demo_flow_kind_identifier(inputs)
});