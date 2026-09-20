/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Continuation_Toggle_BodyInputs */

const en_intake_continuation_toggle_body = /** @type {(inputs: Intake_Continuation_Toggle_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Get a link you can reopen to add information or read replies.`)
};

const es_intake_continuation_toggle_body = /** @type {(inputs: Intake_Continuation_Toggle_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Recibe un enlace que puedes abrir para agregar información o leer respuestas.`)
};

const en_xa2_intake_continuation_toggle_body = /** @type {(inputs: Intake_Continuation_Toggle_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Gèt à lìnk yòù càn rèòpèn tò àdd ìnfòrmàtìòn òr rèàd rèplìès. •••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Get a link you can reopen to add information or read replies." |
*
* @param {Intake_Continuation_Toggle_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_continuation_toggle_body = /** @type {((inputs?: Intake_Continuation_Toggle_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Continuation_Toggle_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_continuation_toggle_body(inputs)
	if (locale === "en-XA") return en_xa2_intake_continuation_toggle_body(inputs)
	return en_intake_continuation_toggle_body(inputs)
});