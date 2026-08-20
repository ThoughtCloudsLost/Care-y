/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Entry_Controls_HeadingInputs */

const en_demo_entry_controls_heading = /** @type {(inputs: Demo_Entry_Controls_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Simulator controls`)
};

const es_demo_entry_controls_heading = /** @type {(inputs: Demo_Entry_Controls_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Controles del simulador`)
};

/**
* | output |
* | --- |
* | "Simulator controls" |
*
* @param {Demo_Entry_Controls_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_entry_controls_heading = /** @type {((inputs?: Demo_Entry_Controls_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Entry_Controls_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_entry_controls_heading(inputs)
	return es_demo_entry_controls_heading(inputs)
});