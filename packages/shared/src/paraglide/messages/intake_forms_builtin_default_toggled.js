/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Builtin_Default_ToggledInputs */

const en_intake_forms_builtin_default_toggled = /** @type {(inputs: Intake_Forms_Builtin_Default_ToggledInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Built-in default form setting updated`)
};

const es_intake_forms_builtin_default_toggled = /** @type {(inputs: Intake_Forms_Builtin_Default_ToggledInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Configuración del formulario predeterminado integrado actualizada`)
};

/**
* | output |
* | --- |
* | "Built-in default form setting updated" |
*
* @param {Intake_Forms_Builtin_Default_ToggledInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_builtin_default_toggled = /** @type {((inputs?: Intake_Forms_Builtin_Default_ToggledInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Builtin_Default_ToggledInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_builtin_default_toggled(inputs)
	return es_intake_forms_builtin_default_toggled(inputs)
});