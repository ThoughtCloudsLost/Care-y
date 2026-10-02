/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Guide_Export_Responses_Step1Inputs */

const en_demo_guide_export_responses_step1 = /** @type {(inputs: Demo_Guide_Export_Responses_Step1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Open the Intake Forms section on the Organization page and pick a form.`)
};

const es_demo_guide_export_responses_step1 = /** @type {(inputs: Demo_Guide_Export_Responses_Step1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Abre la sección Formularios de admisión en la página Organización y elige un formulario.`)
};

const en_xa2_demo_guide_export_responses_step1 = /** @type {(inputs: Demo_Guide_Export_Responses_Step1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Òpèn thè Ìntàkè Fòrms sèctìòn òn thè Òrgànìzàtìòn pàgè ànd pìck à fòrm. ••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Open the Intake Forms section on the Organization page and pick a form." |
*
* @param {Demo_Guide_Export_Responses_Step1Inputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_guide_export_responses_step1 = /** @type {((inputs?: Demo_Guide_Export_Responses_Step1Inputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Guide_Export_Responses_Step1Inputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_guide_export_responses_step1(inputs)
	if (locale === "en-XA") return en_xa2_demo_guide_export_responses_step1(inputs)
	return en_demo_guide_export_responses_step1(inputs)
});