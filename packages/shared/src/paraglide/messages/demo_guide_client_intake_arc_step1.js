/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Guide_Client_Intake_Arc_Step1Inputs */

const en_demo_guide_client_intake_arc_step1 = /** @type {(inputs: Demo_Guide_Client_Intake_Arc_Step1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Open the intake form. No account or sign-in is needed.`)
};

const es_demo_guide_client_intake_arc_step1 = /** @type {(inputs: Demo_Guide_Client_Intake_Arc_Step1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Abre el formulario de admisión. No se necesita cuenta ni inicio de sesión.`)
};

const en_xa2_demo_guide_client_intake_arc_step1 = /** @type {(inputs: Demo_Guide_Client_Intake_Arc_Step1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Òpèn thè ìntàkè fòrm. Nò àccòùnt òr sìgn-ìn ìs nèèdèd. •••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Open the intake form. No account or sign-in is needed." |
*
* @param {Demo_Guide_Client_Intake_Arc_Step1Inputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_guide_client_intake_arc_step1 = /** @type {((inputs?: Demo_Guide_Client_Intake_Arc_Step1Inputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Guide_Client_Intake_Arc_Step1Inputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_guide_client_intake_arc_step1(inputs)
	if (locale === "en-XA") return en_xa2_demo_guide_client_intake_arc_step1(inputs)
	return en_demo_guide_client_intake_arc_step1(inputs)
});