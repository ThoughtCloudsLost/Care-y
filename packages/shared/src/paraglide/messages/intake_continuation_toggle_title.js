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

/**
* | output |
* | --- |
* | "Save a link to add more later (optional)" |
*
* @param {Intake_Continuation_Toggle_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_continuation_toggle_title = /** @type {((inputs?: Intake_Continuation_Toggle_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Continuation_Toggle_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_continuation_toggle_title(inputs)
	return es_intake_continuation_toggle_title(inputs)
});