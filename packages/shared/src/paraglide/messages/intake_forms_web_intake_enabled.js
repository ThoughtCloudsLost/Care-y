/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Web_Intake_EnabledInputs */

const en_intake_forms_web_intake_enabled = /** @type {(inputs: Intake_Forms_Web_Intake_EnabledInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Web intake enabled`)
};

const es_intake_forms_web_intake_enabled = /** @type {(inputs: Intake_Forms_Web_Intake_EnabledInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Recepcion en linea habilitada`)
};

/**
* | output |
* | --- |
* | "Web intake enabled" |
*
* @param {Intake_Forms_Web_Intake_EnabledInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_web_intake_enabled = /** @type {((inputs?: Intake_Forms_Web_Intake_EnabledInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Web_Intake_EnabledInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_web_intake_enabled(inputs)
	return es_intake_forms_web_intake_enabled(inputs)
});