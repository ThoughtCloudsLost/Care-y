/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Guide_Create_Queue_With_Escalation_Step3Inputs */

const en_demo_guide_create_queue_with_escalation_step3 = /** @type {(inputs: Demo_Guide_Create_Queue_With_Escalation_Step3Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Return to the dashboard. The new queue appears as a card with its open and urgent counts.`)
};

const es_demo_guide_create_queue_with_escalation_step3 = /** @type {(inputs: Demo_Guide_Create_Queue_With_Escalation_Step3Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Vuelve al panel. La nueva cola aparece como tarjeta con sus conteos de abiertos y urgentes.`)
};

const en_xa2_demo_guide_create_queue_with_escalation_step3 = /** @type {(inputs: Demo_Guide_Create_Queue_With_Escalation_Step3Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rètùrn tò thè dàshbòàrd. Thè nèw qùèùè àppèàrs às à càrd wìth ìts òpèn ànd ùrgènt còùnts. •••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Return to the dashboard. The new queue appears as a card with its open and urgent counts." |
*
* @param {Demo_Guide_Create_Queue_With_Escalation_Step3Inputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_guide_create_queue_with_escalation_step3 = /** @type {((inputs?: Demo_Guide_Create_Queue_With_Escalation_Step3Inputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Guide_Create_Queue_With_Escalation_Step3Inputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_guide_create_queue_with_escalation_step3(inputs)
	if (locale === "en-XA") return en_xa2_demo_guide_create_queue_with_escalation_step3(inputs)
	return en_demo_guide_create_queue_with_escalation_step3(inputs)
});