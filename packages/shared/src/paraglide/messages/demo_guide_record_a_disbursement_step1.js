/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Guide_Record_A_Disbursement_Step1Inputs */

const en_demo_guide_record_a_disbursement_step1 = /** @type {(inputs: Demo_Guide_Record_A_Disbursement_Step1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Open a ticket whose queue carries a fund. The case panel shows the fund name and available balance.`)
};

const es_demo_guide_record_a_disbursement_step1 = /** @type {(inputs: Demo_Guide_Record_A_Disbursement_Step1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Abre un ticket cuya cola tenga un fondo asignado. El panel del caso muestra el nombre del fondo y el saldo disponible.`)
};

const en_xa2_demo_guide_record_a_disbursement_step1 = /** @type {(inputs: Demo_Guide_Record_A_Disbursement_Step1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Òpèn à tìckèt whòsè qùèùè càrrìès à fùnd. Thè càsè pànèl shòws thè fùnd nàmè ànd àvàìlàblè bàlàncè. ••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Open a ticket whose queue carries a fund. The case panel shows the fund name and available balance." |
*
* @param {Demo_Guide_Record_A_Disbursement_Step1Inputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_guide_record_a_disbursement_step1 = /** @type {((inputs?: Demo_Guide_Record_A_Disbursement_Step1Inputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Guide_Record_A_Disbursement_Step1Inputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_guide_record_a_disbursement_step1(inputs)
	if (locale === "en-XA") return en_xa2_demo_guide_record_a_disbursement_step1(inputs)
	return en_demo_guide_record_a_disbursement_step1(inputs)
});