/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Deepdive_Trust_Boundary_HeadingInputs */

const en_demo_narrative_deepdive_trust_boundary_heading = /** @type {(inputs: Demo_Narrative_Deepdive_Trust_Boundary_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The trust boundary`)
};

const es_demo_narrative_deepdive_trust_boundary_heading = /** @type {(inputs: Demo_Narrative_Deepdive_Trust_Boundary_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La frontera de confianza`)
};

/**
* | output |
* | --- |
* | "The trust boundary" |
*
* @param {Demo_Narrative_Deepdive_Trust_Boundary_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_deepdive_trust_boundary_heading = /** @type {((inputs?: Demo_Narrative_Deepdive_Trust_Boundary_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Deepdive_Trust_Boundary_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_deepdive_trust_boundary_heading(inputs)
	return en_demo_narrative_deepdive_trust_boundary_heading(inputs)
});