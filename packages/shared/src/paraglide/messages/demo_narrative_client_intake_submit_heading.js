/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Client_Intake_Submit_HeadingInputs */

const en_demo_narrative_client_intake_submit_heading = /** @type {(inputs: Demo_Narrative_Client_Intake_Submit_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Submission`)
};

const es_demo_narrative_client_intake_submit_heading = /** @type {(inputs: Demo_Narrative_Client_Intake_Submit_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Envío`)
};

/**
* | output |
* | --- |
* | "Submission" |
*
* @param {Demo_Narrative_Client_Intake_Submit_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_client_intake_submit_heading = /** @type {((inputs?: Demo_Narrative_Client_Intake_Submit_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Client_Intake_Submit_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_client_intake_submit_heading(inputs)
	return en_demo_narrative_client_intake_submit_heading(inputs)
});