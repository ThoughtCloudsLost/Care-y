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

const en_xa2_intake_forms_banner_alt_label = /** @type {(inputs: Intake_Forms_Banner_Alt_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àlt tèxt (òptìònàl, lèàvè blànk fòr dècòràtìvè) •••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Alt text (optional, leave blank for decorative)" |
*
* @param {Intake_Forms_Banner_Alt_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_banner_alt_label = /** @type {((inputs?: Intake_Forms_Banner_Alt_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Banner_Alt_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_banner_alt_label(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_banner_alt_label(inputs)
	return en_intake_forms_banner_alt_label(inputs)
});