/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Web_Intake_EnabledInputs */

const en_intake_forms_web_intake_enabled = /** @type {(inputs: Intake_Forms_Web_Intake_EnabledInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Web intake enabled`)
};

const es_intake_forms_web_intake_enabled = /** @type {(inputs: Intake_Forms_Web_Intake_EnabledInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Recepción en línea habilitada`)
};

const en_xa2_intake_forms_web_intake_enabled = /** @type {(inputs: Intake_Forms_Web_Intake_EnabledInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Wèb ìntàkè ènàblèd ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Web intake enabled" |
*
* @param {Intake_Forms_Web_Intake_EnabledInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_web_intake_enabled = /** @type {((inputs?: Intake_Forms_Web_Intake_EnabledInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Web_Intake_EnabledInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_web_intake_enabled(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_web_intake_enabled(inputs)
	return en_intake_forms_web_intake_enabled(inputs)
});