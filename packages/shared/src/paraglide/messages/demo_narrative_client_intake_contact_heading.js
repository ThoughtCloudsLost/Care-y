/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Client_Intake_Contact_HeadingInputs */

const en_demo_narrative_client_intake_contact_heading = /** @type {(inputs: Demo_Narrative_Client_Intake_Contact_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Contact method and follow-up options`)
};

const es_demo_narrative_client_intake_contact_heading = /** @type {(inputs: Demo_Narrative_Client_Intake_Contact_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Método de contacto y opciones de seguimiento`)
};

/**
* | output |
* | --- |
* | "Contact method and follow-up options" |
*
* @param {Demo_Narrative_Client_Intake_Contact_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_client_intake_contact_heading = /** @type {((inputs?: Demo_Narrative_Client_Intake_Contact_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Client_Intake_Contact_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_client_intake_contact_heading(inputs)
	return en_demo_narrative_client_intake_contact_heading(inputs)
});