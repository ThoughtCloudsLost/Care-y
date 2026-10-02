/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Guide_Configure_Intake_Form_Step4Inputs */

const en_demo_guide_configure_intake_form_step4 = /** @type {(inputs: Demo_Guide_Configure_Intake_Form_Step4Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tap Preview and walk each page of the form.`)
};

const es_demo_guide_configure_intake_form_step4 = /** @type {(inputs: Demo_Guide_Configure_Intake_Form_Step4Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Toca Vista previa y recorre cada página del formulario.`)
};

const en_xa2_demo_guide_configure_intake_form_step4 = /** @type {(inputs: Demo_Guide_Configure_Intake_Form_Step4Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Tàp Prèvìèw ànd wàlk èàch pàgè òf thè fòrm. •••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Tap Preview and walk each page of the form." |
*
* @param {Demo_Guide_Configure_Intake_Form_Step4Inputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_guide_configure_intake_form_step4 = /** @type {((inputs?: Demo_Guide_Configure_Intake_Form_Step4Inputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Guide_Configure_Intake_Form_Step4Inputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_guide_configure_intake_form_step4(inputs)
	if (locale === "en-XA") return en_xa2_demo_guide_configure_intake_form_step4(inputs)
	return en_demo_guide_configure_intake_form_step4(inputs)
});