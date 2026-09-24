/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Getting_Started_Invite_DescInputs */

const en_getting_started_invite_desc = /** @type {(inputs: Getting_Started_Invite_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Share invite links so your team can create accounts.`)
};

const es_getting_started_invite_desc = /** @type {(inputs: Getting_Started_Invite_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Comparte enlaces de invitación para que tu equipo pueda crear cuentas.`)
};

const en_xa2_getting_started_invite_desc = /** @type {(inputs: Getting_Started_Invite_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Shàrè ìnvìtè lìnks sò yòùr tèàm càn crèàtè àccòùnts. ••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Share invite links so your team can create accounts." |
*
* @param {Getting_Started_Invite_DescInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const getting_started_invite_desc = /** @type {((inputs?: Getting_Started_Invite_DescInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Getting_Started_Invite_DescInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_getting_started_invite_desc(inputs)
	if (locale === "en-XA") return en_xa2_getting_started_invite_desc(inputs)
	return en_getting_started_invite_desc(inputs)
});