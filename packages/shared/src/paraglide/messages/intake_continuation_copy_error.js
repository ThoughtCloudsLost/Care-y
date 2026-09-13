/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Continuation_Copy_ErrorInputs */

const en_intake_continuation_copy_error = /** @type {(inputs: Intake_Continuation_Copy_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Could not copy the link. Select it manually and copy.`)
};

const es_intake_continuation_copy_error = /** @type {(inputs: Intake_Continuation_Copy_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No se pudo copiar el enlace. Selecciónalo manualmente y cópialo.`)
};

/**
* | output |
* | --- |
* | "Could not copy the link. Select it manually and copy." |
*
* @param {Intake_Continuation_Copy_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_continuation_copy_error = /** @type {((inputs?: Intake_Continuation_Copy_ErrorInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Continuation_Copy_ErrorInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_continuation_copy_error(inputs)
	return es_intake_continuation_copy_error(inputs)
});