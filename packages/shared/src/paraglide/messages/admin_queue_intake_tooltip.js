/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Queue_Intake_TooltipInputs */

const en_admin_queue_intake_tooltip = /** @type {(inputs: Admin_Queue_Intake_TooltipInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`New caller voicemails are routed to the intake queue`)
};

const es_admin_queue_intake_tooltip = /** @type {(inputs: Admin_Queue_Intake_TooltipInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Los mensajes de voz de nuevos llamantes se envian a la cola de recepción`)
};

const en_xa2_admin_queue_intake_tooltip = /** @type {(inputs: Admin_Queue_Intake_TooltipInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nèw càllèr vòìcèmàìls àrè ròùtèd tò thè ìntàkè qùèùè ••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "New caller voicemails are routed to the intake queue" |
*
* @param {Admin_Queue_Intake_TooltipInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_queue_intake_tooltip = /** @type {((inputs?: Admin_Queue_Intake_TooltipInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queue_Intake_TooltipInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_queue_intake_tooltip(inputs)
	if (locale === "en-XA") return en_xa2_admin_queue_intake_tooltip(inputs)
	return en_admin_queue_intake_tooltip(inputs)
});