/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Client_Intake_Closed_HeadingInputs */

const en_demo_narrative_client_intake_closed_heading = /** @type {(inputs: Demo_Narrative_Client_Intake_Closed_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Closed form`)
};

const es_demo_narrative_client_intake_closed_heading = /** @type {(inputs: Demo_Narrative_Client_Intake_Closed_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Formulario cerrado`)
};

const en_xa2_demo_narrative_client_intake_closed_heading = /** @type {(inputs: Demo_Narrative_Client_Intake_Closed_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Clòsèd fòrm ••••⟧`)
};

/**
* | output |
* | --- |
* | "Closed form" |
*
* @param {Demo_Narrative_Client_Intake_Closed_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_client_intake_closed_heading = /** @type {((inputs?: Demo_Narrative_Client_Intake_Closed_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Client_Intake_Closed_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_client_intake_closed_heading(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_client_intake_closed_heading(inputs)
	return en_demo_narrative_client_intake_closed_heading(inputs)
});