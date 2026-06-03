/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Getting_Started_Invite_DescInputs */

const en_getting_started_invite_desc = /** @type {(inputs: Getting_Started_Invite_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Share invite links so your team can create accounts.`)
};

const es_getting_started_invite_desc = /** @type {(inputs: Getting_Started_Invite_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Comparte enlaces de invitacion para que tu equipo pueda crear cuentas.`)
};

/**
* | output |
* | --- |
* | "Share invite links so your team can create accounts." |
*
* @param {Getting_Started_Invite_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const getting_started_invite_desc = /** @type {((inputs?: Getting_Started_Invite_DescInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Getting_Started_Invite_DescInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_getting_started_invite_desc(inputs)
	return es_getting_started_invite_desc(inputs)
});