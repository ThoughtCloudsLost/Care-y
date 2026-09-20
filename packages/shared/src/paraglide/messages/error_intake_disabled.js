/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Intake_DisabledInputs */

const en_error_intake_disabled = /** @type {(inputs: Error_Intake_DisabledInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Web intake is currently turned off.`)
};

const es_error_intake_disabled = /** @type {(inputs: Error_Intake_DisabledInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La recepción en línea está desactivada.`)
};

const en_xa2_error_intake_disabled = /** @type {(inputs: Error_Intake_DisabledInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Wèb ìntàkè ìs cùrrèntly tùrnèd òff. •••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Web intake is currently turned off." |
*
* @param {Error_Intake_DisabledInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_intake_disabled = /** @type {((inputs?: Error_Intake_DisabledInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Intake_DisabledInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_intake_disabled(inputs)
	if (locale === "en-XA") return en_xa2_error_intake_disabled(inputs)
	return en_error_intake_disabled(inputs)
});