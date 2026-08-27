/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Banner_HeadingInputs */

const en_intake_forms_banner_heading = /** @type {(inputs: Intake_Forms_Banner_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Banner image`)
};

const es_intake_forms_banner_heading = /** @type {(inputs: Intake_Forms_Banner_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Imagen de portada`)
};

/**
* | output |
* | --- |
* | "Banner image" |
*
* @param {Intake_Forms_Banner_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_banner_heading = /** @type {((inputs?: Intake_Forms_Banner_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Banner_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_banner_heading(inputs)
	return es_intake_forms_banner_heading(inputs)
});