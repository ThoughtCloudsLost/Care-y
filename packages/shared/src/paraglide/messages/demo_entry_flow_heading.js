/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Entry_Flow_HeadingInputs */

const en_demo_entry_flow_heading = /** @type {(inputs: Demo_Entry_Flow_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Data flow panel`)
};

const es_demo_entry_flow_heading = /** @type {(inputs: Demo_Entry_Flow_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Panel de flujo de datos`)
};

const en_xa2_demo_entry_flow_heading = /** @type {(inputs: Demo_Entry_Flow_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Dàtà flòw pànèl •••••⟧`)
};

/**
* | output |
* | --- |
* | "Data flow panel" |
*
* @param {Demo_Entry_Flow_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_entry_flow_heading = /** @type {((inputs?: Demo_Entry_Flow_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Entry_Flow_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_entry_flow_heading(inputs)
	if (locale === "en-XA") return en_xa2_demo_entry_flow_heading(inputs)
	return en_demo_entry_flow_heading(inputs)
});