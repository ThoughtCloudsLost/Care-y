/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Guide_Configure_Intake_Form_Step5Inputs */

const en_demo_guide_configure_intake_form_step5 = /** @type {(inputs: Demo_Guide_Configure_Intake_Form_Step5Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Set the form's address, destination queue, and closing date.`)
};

const es_demo_guide_configure_intake_form_step5 = /** @type {(inputs: Demo_Guide_Configure_Intake_Form_Step5Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Configura la dirección del formulario, la cola de destino y la fecha de cierre.`)
};

const en_xa2_demo_guide_configure_intake_form_step5 = /** @type {(inputs: Demo_Guide_Configure_Intake_Form_Step5Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sèt thè fòrm's àddrèss, dèstìnàtìòn qùèùè, ànd clòsìng dàtè. ••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Set the form's address, destination queue, and closing date." |
*
* @param {Demo_Guide_Configure_Intake_Form_Step5Inputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_guide_configure_intake_form_step5 = /** @type {((inputs?: Demo_Guide_Configure_Intake_Form_Step5Inputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Guide_Configure_Intake_Form_Step5Inputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_guide_configure_intake_form_step5(inputs)
	if (locale === "en-XA") return en_xa2_demo_guide_configure_intake_form_step5(inputs)
	return en_demo_guide_configure_intake_form_step5(inputs)
});