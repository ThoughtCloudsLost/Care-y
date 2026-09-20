/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Link_CopiedInputs */

const en_intake_forms_link_copied = /** @type {(inputs: Intake_Forms_Link_CopiedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Link copied`)
};

const es_intake_forms_link_copied = /** @type {(inputs: Intake_Forms_Link_CopiedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enlace copiado`)
};

const en_xa2_intake_forms_link_copied = /** @type {(inputs: Intake_Forms_Link_CopiedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Lìnk còpìèd ••••⟧`)
};

/**
* | output |
* | --- |
* | "Link copied" |
*
* @param {Intake_Forms_Link_CopiedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_link_copied = /** @type {((inputs?: Intake_Forms_Link_CopiedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Link_CopiedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_link_copied(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_link_copied(inputs)
	return en_intake_forms_link_copied(inputs)
});