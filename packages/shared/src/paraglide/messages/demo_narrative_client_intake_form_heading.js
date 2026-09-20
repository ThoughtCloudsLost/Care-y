/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Client_Intake_Form_HeadingInputs */

const en_demo_narrative_client_intake_form_heading = /** @type {(inputs: Demo_Narrative_Client_Intake_Form_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The intake page`)
};

const es_demo_narrative_client_intake_form_heading = /** @type {(inputs: Demo_Narrative_Client_Intake_Form_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La página de admisión`)
};

const en_xa2_demo_narrative_client_intake_form_heading = /** @type {(inputs: Demo_Narrative_Client_Intake_Form_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè ìntàkè pàgè •••••⟧`)
};

/**
* | output |
* | --- |
* | "The intake page" |
*
* @param {Demo_Narrative_Client_Intake_Form_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_client_intake_form_heading = /** @type {((inputs?: Demo_Narrative_Client_Intake_Form_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Client_Intake_Form_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_client_intake_form_heading(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_client_intake_form_heading(inputs)
	return en_demo_narrative_client_intake_form_heading(inputs)
});