/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Volunteer: NonNullable<unknown>, Client: NonNullable<unknown> }} Onboarding_Briefing_Terminology_NoteInputs */

const en_onboarding_briefing_terminology_note = /** @type {(inputs: Onboarding_Briefing_Terminology_NoteInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Your organization uses "${i?.Volunteer}" and "${i?.Client}" as role names. This briefing uses the default terms "volunteer" and "client" for clarity.`)
};

const es_onboarding_briefing_terminology_note = /** @type {(inputs: Onboarding_Briefing_Terminology_NoteInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Su organización usa "${i?.Volunteer}" y "${i?.Client}" como nombres de roles. Este informe usa los términos predeterminados "voluntario" y "cliente" para mayor claridad.`)
};

const en_xa2_onboarding_briefing_terminology_note = /** @type {(inputs: Onboarding_Briefing_Terminology_NoteInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Yòùr òrgànìzàtìòn ùsès " ••••••••${i?.Volunteer}" ànd " •••${i?.Client}" às ròlè nàmès. Thìs brìèfìng ùsès thè dèfàùlt tèrms "vòlùntèèr" ànd "clìènt" fòr clàrìty. ••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Your organization uses \"{Volunteer}\" and \"{Client}\" as role names. This briefing uses the default terms \"volunteer\" and \"client\" for clarity." |
*
* @param {Onboarding_Briefing_Terminology_NoteInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_terminology_note = /** @type {((inputs: Onboarding_Briefing_Terminology_NoteInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Terminology_NoteInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_briefing_terminology_note(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_briefing_terminology_note(inputs)
	return en_onboarding_briefing_terminology_note(inputs)
});