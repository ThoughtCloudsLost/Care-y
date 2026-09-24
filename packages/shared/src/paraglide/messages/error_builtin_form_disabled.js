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

const en_xa2_error_builtin_form_disabled = /** @type {(inputs: Error_Builtin_Form_DisabledInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè dèfàùlt ìntàkè fòrm ìs nòt àvàìlàblè. •••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The default intake form is not available." |
*
* @param {Error_Builtin_Form_DisabledInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_builtin_form_disabled = /** @type {((inputs?: Error_Builtin_Form_DisabledInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Builtin_Form_DisabledInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_builtin_form_disabled(inputs)
	if (locale === "en-XA") return en_xa2_error_builtin_form_disabled(inputs)
	return en_error_builtin_form_disabled(inputs)
});