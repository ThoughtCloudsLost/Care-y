/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Builtin_Default_EnabledInputs */

const en_intake_forms_builtin_default_enabled = /** @type {(inputs: Intake_Forms_Builtin_Default_EnabledInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Built-in default form`)
};

const es_intake_forms_builtin_default_enabled = /** @type {(inputs: Intake_Forms_Builtin_Default_EnabledInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Formulario predeterminado integrado`)
};

/**
* | output |
* | --- |
* | "Built-in default form" |
*
* @param {Intake_Forms_Builtin_Default_EnabledInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_builtin_default_enabled = /** @type {((inputs?: Intake_Forms_Builtin_Default_EnabledInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Builtin_Default_EnabledInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_builtin_default_enabled(inputs)
	return es_intake_forms_builtin_default_enabled(inputs)
});