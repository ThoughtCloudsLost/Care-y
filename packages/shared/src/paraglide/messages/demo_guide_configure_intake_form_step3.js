/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Guide_Configure_Intake_Form_Step3Inputs */

const en_demo_guide_configure_intake_form_step3 = /** @type {(inputs: Demo_Guide_Configure_Intake_Form_Step3Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Open a field to set its label, type, and role.`)
};

const es_demo_guide_configure_intake_form_step3 = /** @type {(inputs: Demo_Guide_Configure_Intake_Form_Step3Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Abre un campo para configurar su etiqueta, tipo y rol.`)
};

const en_xa2_demo_guide_configure_intake_form_step3 = /** @type {(inputs: Demo_Guide_Configure_Intake_Form_Step3Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Òpèn à fìèld tò sèt ìts làbèl, typè, ànd ròlè. ••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Open a field to set its label, type, and role." |
*
* @param {Demo_Guide_Configure_Intake_Form_Step3Inputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_guide_configure_intake_form_step3 = /** @type {((inputs?: Demo_Guide_Configure_Intake_Form_Step3Inputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Guide_Configure_Intake_Form_Step3Inputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_guide_configure_intake_form_step3(inputs)
	if (locale === "en-XA") return en_xa2_demo_guide_configure_intake_form_step3(inputs)
	return en_demo_guide_configure_intake_form_step3(inputs)
});