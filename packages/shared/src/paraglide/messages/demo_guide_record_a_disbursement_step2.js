/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Guide_Record_A_Disbursement_Step2Inputs */

const en_demo_guide_record_a_disbursement_step2 = /** @type {(inputs: Demo_Guide_Record_A_Disbursement_Step2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tap Record disbursement in the compose actions. Enter the amount, confirm the fund, and save.`)
};

const es_demo_guide_record_a_disbursement_step2 = /** @type {(inputs: Demo_Guide_Record_A_Disbursement_Step2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Toca Registrar desembolso en las acciones de redacción. Ingresa el monto, confirma el fondo y guarda.`)
};

const en_xa2_demo_guide_record_a_disbursement_step2 = /** @type {(inputs: Demo_Guide_Record_A_Disbursement_Step2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Tàp Rècòrd dìsbùrsèmènt ìn thè còmpòsè àctìòns. Èntèr thè àmòùnt, cònfìrm thè fùnd, ànd sàvè. ••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Tap Record disbursement in the compose actions. Enter the amount, confirm the fund, and save." |
*
* @param {Demo_Guide_Record_A_Disbursement_Step2Inputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_guide_record_a_disbursement_step2 = /** @type {((inputs?: Demo_Guide_Record_A_Disbursement_Step2Inputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Guide_Record_A_Disbursement_Step2Inputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_guide_record_a_disbursement_step2(inputs)
	if (locale === "en-XA") return en_xa2_demo_guide_record_a_disbursement_step2(inputs)
	return en_demo_guide_record_a_disbursement_step2(inputs)
});