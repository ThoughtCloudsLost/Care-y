/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Deepdive_How_Keys_Are_Derived_HeadingInputs */

const en_demo_narrative_deepdive_how_keys_are_derived_heading = /** @type {(inputs: Demo_Narrative_Deepdive_How_Keys_Are_Derived_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`How keys are derived`)
};

const es_demo_narrative_deepdive_how_keys_are_derived_heading = /** @type {(inputs: Demo_Narrative_Deepdive_How_Keys_Are_Derived_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cómo se derivan las claves`)
};

const en_xa2_demo_narrative_deepdive_how_keys_are_derived_heading = /** @type {(inputs: Demo_Narrative_Deepdive_How_Keys_Are_Derived_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Hòw kèys àrè dèrìvèd ••••••⟧`)
};

/**
* | output |
* | --- |
* | "How keys are derived" |
*
* @param {Demo_Narrative_Deepdive_How_Keys_Are_Derived_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_deepdive_how_keys_are_derived_heading = /** @type {((inputs?: Demo_Narrative_Deepdive_How_Keys_Are_Derived_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Deepdive_How_Keys_Are_Derived_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_deepdive_how_keys_are_derived_heading(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_deepdive_how_keys_are_derived_heading(inputs)
	return en_demo_narrative_deepdive_how_keys_are_derived_heading(inputs)
});