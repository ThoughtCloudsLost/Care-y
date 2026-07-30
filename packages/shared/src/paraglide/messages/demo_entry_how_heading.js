/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Entry_How_HeadingInputs */

const en_demo_entry_how_heading = /** @type {(inputs: Demo_Entry_How_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A story and a working app`)
};

const es_demo_entry_how_heading = /** @type {(inputs: Demo_Entry_How_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Un relato y una aplicacion real`)
};

/**
* | output |
* | --- |
* | "A story and a working app" |
*
* @param {Demo_Entry_How_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_entry_how_heading = /** @type {((inputs?: Demo_Entry_How_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Entry_How_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_entry_how_heading(inputs)
	return es_demo_entry_how_heading(inputs)
});