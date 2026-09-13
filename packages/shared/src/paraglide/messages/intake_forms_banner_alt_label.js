/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Banner_Alt_LabelInputs */

const en_intake_forms_banner_alt_label = /** @type {(inputs: Intake_Forms_Banner_Alt_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Alt text (optional, leave blank for decorative)`)
};

const es_intake_forms_banner_alt_label = /** @type {(inputs: Intake_Forms_Banner_Alt_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Texto alternativo (opcional, dejar vacio para decorativa)`)
};

/**
* | output |
* | --- |
* | "Alt text (optional, leave blank for decorative)" |
*
* @param {Intake_Forms_Banner_Alt_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_banner_alt_label = /** @type {((inputs?: Intake_Forms_Banner_Alt_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Banner_Alt_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_banner_alt_label(inputs)
	return es_intake_forms_banner_alt_label(inputs)
});