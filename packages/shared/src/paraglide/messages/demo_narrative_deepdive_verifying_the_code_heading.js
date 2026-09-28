/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Deepdive_Verifying_The_Code_HeadingInputs */

const en_demo_narrative_deepdive_verifying_the_code_heading = /** @type {(inputs: Demo_Narrative_Deepdive_Verifying_The_Code_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Verifying the code`)
};

const es_demo_narrative_deepdive_verifying_the_code_heading = /** @type {(inputs: Demo_Narrative_Deepdive_Verifying_The_Code_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Verificar el código`)
};

const en_xa2_demo_narrative_deepdive_verifying_the_code_heading = /** @type {(inputs: Demo_Narrative_Deepdive_Verifying_The_Code_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Vèrìfyìng thè còdè ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Verifying the code" |
*
* @param {Demo_Narrative_Deepdive_Verifying_The_Code_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_deepdive_verifying_the_code_heading = /** @type {((inputs?: Demo_Narrative_Deepdive_Verifying_The_Code_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Deepdive_Verifying_The_Code_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_deepdive_verifying_the_code_heading(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_deepdive_verifying_the_code_heading(inputs)
	return en_demo_narrative_deepdive_verifying_the_code_heading(inputs)
});