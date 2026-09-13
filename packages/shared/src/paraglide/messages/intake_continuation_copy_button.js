/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Continuation_Copy_ButtonInputs */

const en_intake_continuation_copy_button = /** @type {(inputs: Intake_Continuation_Copy_ButtonInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Copy link`)
};

const es_intake_continuation_copy_button = /** @type {(inputs: Intake_Continuation_Copy_ButtonInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Copiar enlace`)
};

/**
* | output |
* | --- |
* | "Copy link" |
*
* @param {Intake_Continuation_Copy_ButtonInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_continuation_copy_button = /** @type {((inputs?: Intake_Continuation_Copy_ButtonInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Continuation_Copy_ButtonInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_continuation_copy_button(inputs)
	return es_intake_continuation_copy_button(inputs)
});