/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Guide_Record_A_Disbursement_Step3Inputs */

const en_demo_guide_record_a_disbursement_step3 = /** @type {(inputs: Demo_Guide_Record_A_Disbursement_Step3Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Find the disbursement note in the thread. It shows the amount and the fund name.`)
};

const es_demo_guide_record_a_disbursement_step3 = /** @type {(inputs: Demo_Guide_Record_A_Disbursement_Step3Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Busca la nota de desembolso en el hilo. Muestra el monto y el nombre del fondo.`)
};

const en_xa2_demo_guide_record_a_disbursement_step3 = /** @type {(inputs: Demo_Guide_Record_A_Disbursement_Step3Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Fìnd thè dìsbùrsèmènt nòtè ìn thè thrèàd. Ìt shòws thè àmòùnt ànd thè fùnd nàmè. ••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Find the disbursement note in the thread. It shows the amount and the fund name." |
*
* @param {Demo_Guide_Record_A_Disbursement_Step3Inputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_guide_record_a_disbursement_step3 = /** @type {((inputs?: Demo_Guide_Record_A_Disbursement_Step3Inputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Guide_Record_A_Disbursement_Step3Inputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_guide_record_a_disbursement_step3(inputs)
	if (locale === "en-XA") return en_xa2_demo_guide_record_a_disbursement_step3(inputs)
	return en_demo_guide_record_a_disbursement_step3(inputs)
});