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

/**
* | output |
* | --- |
* | "Get a link you can reopen to add information or read replies." |
*
* @param {Intake_Continuation_Toggle_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_continuation_toggle_body = /** @type {((inputs?: Intake_Continuation_Toggle_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Continuation_Toggle_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_continuation_toggle_body(inputs)
	return es_intake_continuation_toggle_body(inputs)
});