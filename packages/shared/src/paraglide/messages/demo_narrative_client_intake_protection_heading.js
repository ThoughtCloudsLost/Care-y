/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Client_Intake_Protection_HeadingInputs */

const en_demo_narrative_client_intake_protection_heading = /** @type {(inputs: Demo_Narrative_Client_Intake_Protection_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`How the visitor is protected`)
};

const es_demo_narrative_client_intake_protection_heading = /** @type {(inputs: Demo_Narrative_Client_Intake_Protection_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cómo se protege al visitante`)
};

/**
* | output |
* | --- |
* | "How the visitor is protected" |
*
* @param {Demo_Narrative_Client_Intake_Protection_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_client_intake_protection_heading = /** @type {((inputs?: Demo_Narrative_Client_Intake_Protection_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Client_Intake_Protection_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_client_intake_protection_heading(inputs)
	return en_demo_narrative_client_intake_protection_heading(inputs)
});