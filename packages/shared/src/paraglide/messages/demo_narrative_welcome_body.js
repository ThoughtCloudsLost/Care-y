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

const en_xa2_demo_narrative_welcome_body = /** @type {(inputs: Demo_Narrative_Welcome_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Tàp à fèàtùrè ìn thè lìst òr ùsè thè CÀRÈ-Y sìmùlàtòr tò èxplòrè ànd lèàrn mòrè àbòùt CÀRÈ-Y. ••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Tap a feature in the list or use the CARE-Y simulator to explore and learn more about CARE-Y." |
*
* @param {Demo_Narrative_Welcome_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_welcome_body = /** @type {((inputs?: Demo_Narrative_Welcome_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Welcome_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_welcome_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_welcome_body(inputs)
	return en_demo_narrative_welcome_body(inputs)
});