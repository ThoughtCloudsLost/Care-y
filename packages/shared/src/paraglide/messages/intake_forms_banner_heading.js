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

const en_xa2_intake_forms_banner_heading = /** @type {(inputs: Intake_Forms_Banner_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Bànnèr ìmàgè ••••⟧`)
};

/**
* | output |
* | --- |
* | "Banner image" |
*
* @param {Intake_Forms_Banner_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_banner_heading = /** @type {((inputs?: Intake_Forms_Banner_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Banner_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_banner_heading(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_banner_heading(inputs)
	return en_intake_forms_banner_heading(inputs)
});