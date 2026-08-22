/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Welcome_BodyInputs */

const en_demo_narrative_welcome_body = /** @type {(inputs: Demo_Narrative_Welcome_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tap a feature in the list or use the CARE-Y simulator to explore and learn more about CARE-Y.`)
};

const es_demo_narrative_welcome_body = /** @type {(inputs: Demo_Narrative_Welcome_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Toca una función en la lista o usa el simulador CARE-Y para explorar y conocer más sobre CARE-Y.`)
};

/**
* | output |
* | --- |
* | "Tap a feature in the list or use the CARE-Y simulator to explore and learn more about CARE-Y." |
*
* @param {Demo_Narrative_Welcome_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_welcome_body = /** @type {((inputs?: Demo_Narrative_Welcome_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Welcome_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_welcome_body(inputs)
	return es_demo_narrative_welcome_body(inputs)
});