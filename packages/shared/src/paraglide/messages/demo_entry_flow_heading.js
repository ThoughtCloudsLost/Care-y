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

/**
* | output |
* | --- |
* | "Data flow panel" |
*
* @param {Demo_Entry_Flow_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_entry_flow_heading = /** @type {((inputs?: Demo_Entry_Flow_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Entry_Flow_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_entry_flow_heading(inputs)
	return es_demo_entry_flow_heading(inputs)
});