/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Queue_Intake_ClearInputs */

const en_admin_queue_intake_clear = /** @type {(inputs: Admin_Queue_Intake_ClearInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Remove intake designation`)
};

const es_admin_queue_intake_clear = /** @type {(inputs: Admin_Queue_Intake_ClearInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Quitar designación de recepción`)
};

const en_xa2_admin_queue_intake_clear = /** @type {(inputs: Admin_Queue_Intake_ClearInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rèmòvè ìntàkè dèsìgnàtìòn ••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Remove intake designation" |
*
* @param {Admin_Queue_Intake_ClearInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_queue_intake_clear = /** @type {((inputs?: Admin_Queue_Intake_ClearInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queue_Intake_ClearInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_queue_intake_clear(inputs)
	if (locale === "en-XA") return en_xa2_admin_queue_intake_clear(inputs)
	return en_admin_queue_intake_clear(inputs)
});