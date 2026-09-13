/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Destination_NoneInputs */

const en_intake_forms_destination_none = /** @type {(inputs: Intake_Forms_Destination_NoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Default intake queue`)
};

const es_intake_forms_destination_none = /** @type {(inputs: Intake_Forms_Destination_NoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cola de recepcion predeterminada`)
};

/**
* | output |
* | --- |
* | "Default intake queue" |
*
* @param {Intake_Forms_Destination_NoneInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_destination_none = /** @type {((inputs?: Intake_Forms_Destination_NoneInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Destination_NoneInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_destination_none(inputs)
	return es_intake_forms_destination_none(inputs)
});