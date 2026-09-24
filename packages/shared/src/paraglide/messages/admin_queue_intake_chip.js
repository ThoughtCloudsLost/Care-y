/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Queue_Intake_ChipInputs */

const en_admin_queue_intake_chip = /** @type {(inputs: Admin_Queue_Intake_ChipInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Intake`)
};

const es_admin_queue_intake_chip = /** @type {(inputs: Admin_Queue_Intake_ChipInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Recepción`)
};

const en_xa2_admin_queue_intake_chip = /** @type {(inputs: Admin_Queue_Intake_ChipInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ìntàkè ••⟧`)
};

/**
* | output |
* | --- |
* | "Intake" |
*
* @param {Admin_Queue_Intake_ChipInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_queue_intake_chip = /** @type {((inputs?: Admin_Queue_Intake_ChipInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queue_Intake_ChipInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_queue_intake_chip(inputs)
	if (locale === "en-XA") return en_xa2_admin_queue_intake_chip(inputs)
	return en_admin_queue_intake_chip(inputs)
});