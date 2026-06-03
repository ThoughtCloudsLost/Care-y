/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Org_Terminology_Admin_NoteInputs */

const en_onboarding_org_terminology_admin_note = /** @type {(inputs: Onboarding_Org_Terminology_Admin_NoteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Other languages can be configured later in Organization Settings.`)
};

const es_onboarding_org_terminology_admin_note = /** @type {(inputs: Onboarding_Org_Terminology_Admin_NoteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Otros idiomas se pueden configurar después en la configuración de la organización.`)
};

/**
* | output |
* | --- |
* | "Other languages can be configured later in Organization Settings." |
*
* @param {Onboarding_Org_Terminology_Admin_NoteInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_org_terminology_admin_note = /** @type {((inputs?: Onboarding_Org_Terminology_Admin_NoteInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Org_Terminology_Admin_NoteInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_org_terminology_admin_note(inputs)
	return es_onboarding_org_terminology_admin_note(inputs)
});