/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Welcome_HeadingInputs */

const en_demo_narrative_welcome_heading = /** @type {(inputs: Demo_Narrative_Welcome_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Welcome to the CARE-Y handbook`)
};

const es_demo_narrative_welcome_heading = /** @type {(inputs: Demo_Narrative_Welcome_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Bienvenido al manual de CARE-Y`)
};

/**
* | output |
* | --- |
* | "Welcome to the CARE-Y handbook" |
*
* @param {Demo_Narrative_Welcome_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_welcome_heading = /** @type {((inputs?: Demo_Narrative_Welcome_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Welcome_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_welcome_heading(inputs)
	return es_demo_narrative_welcome_heading(inputs)
});