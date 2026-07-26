/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Queue_Intake_ChipInputs */

const en_admin_queue_intake_chip = /** @type {(inputs: Admin_Queue_Intake_ChipInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Intake`)
};

const es_admin_queue_intake_chip = /** @type {(inputs: Admin_Queue_Intake_ChipInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Recepcion`)
};

/**
* | output |
* | --- |
* | "Intake" |
*
* @param {Admin_Queue_Intake_ChipInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queue_intake_chip = /** @type {((inputs?: Admin_Queue_Intake_ChipInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queue_Intake_ChipInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_queue_intake_chip(inputs)
	return es_admin_queue_intake_chip(inputs)
});