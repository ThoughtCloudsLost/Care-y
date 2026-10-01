/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ volunteers: NonNullable<unknown> }} Funds_Page_IntroInputs */

const en_funds_page_intro = /** @type {(inputs: Funds_Page_IntroInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Balances add up what ${i?.volunteers} have recorded. They track money set aside for each purpose, not a bank account.`)
};

const es_funds_page_intro = /** @type {(inputs: Funds_Page_IntroInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Los saldos suman lo que han registrado los ${i?.volunteers}. Controlan el dinero reservado para cada fin, no una cuenta bancaria.`)
};

const en_xa2_funds_page_intro = /** @type {(inputs: Funds_Page_IntroInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Bàlàncès àdd ùp whàt  •••••••${i?.volunteers} hàvè rècòrdèd. Thèy tràck mònèy sèt àsìdè fòr èàch pùrpòsè, nòt à bànk àccòùnt. ••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Balances add up what {volunteers} have recorded. They track money set aside for each purpose, not a bank account." |
*
* @param {Funds_Page_IntroInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const funds_page_intro = /** @type {((inputs: Funds_Page_IntroInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Funds_Page_IntroInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_funds_page_intro(inputs)
	if (locale === "en-XA") return en_xa2_funds_page_intro(inputs)
	return en_funds_page_intro(inputs)
});