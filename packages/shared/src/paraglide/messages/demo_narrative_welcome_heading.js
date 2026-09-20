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

const en_xa2_demo_narrative_welcome_heading = /** @type {(inputs: Demo_Narrative_Welcome_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Wèlcòmè tò thè CÀRÈ-Y hàndbòòk •••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Welcome to the CARE-Y handbook" |
*
* @param {Demo_Narrative_Welcome_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_welcome_heading = /** @type {((inputs?: Demo_Narrative_Welcome_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Welcome_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_welcome_heading(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_welcome_heading(inputs)
	return en_demo_narrative_welcome_heading(inputs)
});