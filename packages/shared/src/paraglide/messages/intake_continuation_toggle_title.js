/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Continuation_Toggle_TitleInputs */

const en_intake_continuation_toggle_title = /** @type {(inputs: Intake_Continuation_Toggle_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Save a link to add more later (optional)`)
};

const es_intake_continuation_toggle_title = /** @type {(inputs: Intake_Continuation_Toggle_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Guardar un enlace para agregar más tarde (opcional)`)
};

const en_xa2_intake_continuation_toggle_title = /** @type {(inputs: Intake_Continuation_Toggle_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sàvè à lìnk tò àdd mòrè làtèr (òptìònàl) ••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Save a link to add more later (optional)" |
*
* @param {Intake_Continuation_Toggle_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_continuation_toggle_title = /** @type {((inputs?: Intake_Continuation_Toggle_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Continuation_Toggle_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_continuation_toggle_title(inputs)
	if (locale === "en-XA") return en_xa2_intake_continuation_toggle_title(inputs)
	return en_intake_continuation_toggle_title(inputs)
});