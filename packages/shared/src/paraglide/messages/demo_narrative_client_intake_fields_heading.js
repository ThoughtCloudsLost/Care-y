/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Client_Intake_Fields_HeadingInputs */

const en_demo_narrative_client_intake_fields_heading = /** @type {(inputs: Demo_Narrative_Client_Intake_Fields_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Custom form fields`)
};

const es_demo_narrative_client_intake_fields_heading = /** @type {(inputs: Demo_Narrative_Client_Intake_Fields_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Campos de formulario personalizado`)
};

const en_xa2_demo_narrative_client_intake_fields_heading = /** @type {(inputs: Demo_Narrative_Client_Intake_Fields_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Cùstòm fòrm fìèlds ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Custom form fields" |
*
* @param {Demo_Narrative_Client_Intake_Fields_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_client_intake_fields_heading = /** @type {((inputs?: Demo_Narrative_Client_Intake_Fields_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Client_Intake_Fields_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_client_intake_fields_heading(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_client_intake_fields_heading(inputs)
	return en_demo_narrative_client_intake_fields_heading(inputs)
});