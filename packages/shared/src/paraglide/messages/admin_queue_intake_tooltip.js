/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Queue_Intake_TooltipInputs */

const en_admin_queue_intake_tooltip = /** @type {(inputs: Admin_Queue_Intake_TooltipInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`New caller voicemails are routed to the intake queue`)
};

const es_admin_queue_intake_tooltip = /** @type {(inputs: Admin_Queue_Intake_TooltipInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Los mensajes de voz de nuevos llamantes se envian a la cola de recepcion`)
};

/**
* | output |
* | --- |
* | "New caller voicemails are routed to the intake queue" |
*
* @param {Admin_Queue_Intake_TooltipInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queue_intake_tooltip = /** @type {((inputs?: Admin_Queue_Intake_TooltipInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queue_Intake_TooltipInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_queue_intake_tooltip(inputs)
	return es_admin_queue_intake_tooltip(inputs)
});