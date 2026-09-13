/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Builtin_Form_DisabledInputs */

const en_error_builtin_form_disabled = /** @type {(inputs: Error_Builtin_Form_DisabledInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The default intake form is not available.`)
};

const es_error_builtin_form_disabled = /** @type {(inputs: Error_Builtin_Form_DisabledInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El formulario de ingreso predeterminado no está disponible.`)
};

/**
* | output |
* | --- |
* | "The default intake form is not available." |
*
* @param {Error_Builtin_Form_DisabledInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_builtin_form_disabled = /** @type {((inputs?: Error_Builtin_Form_DisabledInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Builtin_Form_DisabledInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_error_builtin_form_disabled(inputs)
	return es_error_builtin_form_disabled(inputs)
});