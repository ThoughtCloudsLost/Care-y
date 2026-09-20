/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Tickets_Select_PromptInputs */

const en_tickets_select_prompt = /** @type {(inputs: Tickets_Select_PromptInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Select a ticket to view`)
};

const es_tickets_select_prompt = /** @type {(inputs: Tickets_Select_PromptInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Selecciona un ticket para ver`)
};

const en_xa2_tickets_select_prompt = /** @type {(inputs: Tickets_Select_PromptInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sèlèct à tìckèt tò vìèw •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Select a ticket to view" |
*
* @param {Tickets_Select_PromptInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const tickets_select_prompt = /** @type {((inputs?: Tickets_Select_PromptInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_Select_PromptInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_tickets_select_prompt(inputs)
	if (locale === "en-XA") return en_xa2_tickets_select_prompt(inputs)
	return en_tickets_select_prompt(inputs)
});