/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Guide_Create_Queue_With_Escalation_TitleInputs */

const en_demo_guide_create_queue_with_escalation_title = /** @type {(inputs: Demo_Guide_Create_Queue_With_Escalation_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Create a queue with escalation`)
};

const es_demo_guide_create_queue_with_escalation_title = /** @type {(inputs: Demo_Guide_Create_Queue_With_Escalation_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Crear una cola con escalación`)
};

const en_xa2_demo_guide_create_queue_with_escalation_title = /** @type {(inputs: Demo_Guide_Create_Queue_With_Escalation_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Crèàtè à qùèùè wìth èscàlàtìòn •••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Create a queue with escalation" |
*
* @param {Demo_Guide_Create_Queue_With_Escalation_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_guide_create_queue_with_escalation_title = /** @type {((inputs?: Demo_Guide_Create_Queue_With_Escalation_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Guide_Create_Queue_With_Escalation_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_guide_create_queue_with_escalation_title(inputs)
	if (locale === "en-XA") return en_xa2_demo_guide_create_queue_with_escalation_title(inputs)
	return en_demo_guide_create_queue_with_escalation_title(inputs)
});