/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Guide_Create_Queue_With_Escalation_Step1Inputs */

const en_demo_guide_create_queue_with_escalation_step1 = /** @type {(inputs: Demo_Guide_Create_Queue_With_Escalation_Step1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Open the Queues tab on the People page and tap Create queue. Set the name and the escalation days.`)
};

const es_demo_guide_create_queue_with_escalation_step1 = /** @type {(inputs: Demo_Guide_Create_Queue_With_Escalation_Step1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Abre la pestaña Colas en la página Personas y toca Crear cola. Configura el nombre y los días de escalación.`)
};

const en_xa2_demo_guide_create_queue_with_escalation_step1 = /** @type {(inputs: Demo_Guide_Create_Queue_With_Escalation_Step1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Òpèn thè Qùèùès tàb òn thè Pèòplè pàgè ànd tàp Crèàtè qùèùè. Sèt thè nàmè ànd thè èscàlàtìòn dàys. ••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Open the Queues tab on the People page and tap Create queue. Set the name and the escalation days." |
*
* @param {Demo_Guide_Create_Queue_With_Escalation_Step1Inputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_guide_create_queue_with_escalation_step1 = /** @type {((inputs?: Demo_Guide_Create_Queue_With_Escalation_Step1Inputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Guide_Create_Queue_With_Escalation_Step1Inputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_guide_create_queue_with_escalation_step1(inputs)
	if (locale === "en-XA") return en_xa2_demo_guide_create_queue_with_escalation_step1(inputs)
	return en_demo_guide_create_queue_with_escalation_step1(inputs)
});