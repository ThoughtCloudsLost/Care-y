/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Deepdive_How_Encryption_Works_HeadingInputs */

const en_demo_narrative_deepdive_how_encryption_works_heading = /** @type {(inputs: Demo_Narrative_Deepdive_How_Encryption_Works_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`How encryption works`)
};

const es_demo_narrative_deepdive_how_encryption_works_heading = /** @type {(inputs: Demo_Narrative_Deepdive_How_Encryption_Works_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cómo funciona el cifrado`)
};

/**
* | output |
* | --- |
* | "How encryption works" |
*
* @param {Demo_Narrative_Deepdive_How_Encryption_Works_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_deepdive_how_encryption_works_heading = /** @type {((inputs?: Demo_Narrative_Deepdive_How_Encryption_Works_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Deepdive_How_Encryption_Works_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_deepdive_how_encryption_works_heading(inputs)
	return en_demo_narrative_deepdive_how_encryption_works_heading(inputs)
});