/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Guide_Create_Queue_With_Escalation_Step2Inputs */

const en_demo_guide_create_queue_with_escalation_step2 = /** @type {(inputs: Demo_Guide_Create_Queue_With_Escalation_Step2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Open the Roles tab and review which permissions the queue's members hold.`)
};

const es_demo_guide_create_queue_with_escalation_step2 = /** @type {(inputs: Demo_Guide_Create_Queue_With_Escalation_Step2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Abre la pestaña Roles y revisa qué permisos tienen los miembros de la cola.`)
};

const en_xa2_demo_guide_create_queue_with_escalation_step2 = /** @type {(inputs: Demo_Guide_Create_Queue_With_Escalation_Step2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Òpèn thè Ròlès tàb ànd rèvìèw whìch pèrmìssìòns thè qùèùè's mèmbèrs hòld. ••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Open the Roles tab and review which permissions the queue's members hold." |
*
* @param {Demo_Guide_Create_Queue_With_Escalation_Step2Inputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_guide_create_queue_with_escalation_step2 = /** @type {((inputs?: Demo_Guide_Create_Queue_With_Escalation_Step2Inputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Guide_Create_Queue_With_Escalation_Step2Inputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_guide_create_queue_with_escalation_step2(inputs)
	if (locale === "en-XA") return en_xa2_demo_guide_create_queue_with_escalation_step2(inputs)
	return en_demo_guide_create_queue_with_escalation_step2(inputs)
});