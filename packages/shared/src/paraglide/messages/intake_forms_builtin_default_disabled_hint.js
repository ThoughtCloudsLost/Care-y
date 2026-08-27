/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Builtin_Default_Disabled_HintInputs */

const en_intake_forms_builtin_default_disabled_hint = /** @type {(inputs: Intake_Forms_Builtin_Default_Disabled_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`When off, /intake shows a not-available message unless a custom default form is active.`)
};

const es_intake_forms_builtin_default_disabled_hint = /** @type {(inputs: Intake_Forms_Builtin_Default_Disabled_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cuando está desactivado, /intake muestra un mensaje de no disponible a menos que haya un formulario predeterminado personalizado activo.`)
};

/**
* | output |
* | --- |
* | "When off, /intake shows a not-available message unless a custom default form is active." |
*
* @param {Intake_Forms_Builtin_Default_Disabled_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_builtin_default_disabled_hint = /** @type {((inputs?: Intake_Forms_Builtin_Default_Disabled_HintInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Builtin_Default_Disabled_HintInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_builtin_default_disabled_hint(inputs)
	return es_intake_forms_builtin_default_disabled_hint(inputs)
});