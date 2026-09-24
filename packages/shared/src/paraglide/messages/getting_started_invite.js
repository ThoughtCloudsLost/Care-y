/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Getting_Started_InviteInputs */

const en_getting_started_invite = /** @type {(inputs: Getting_Started_InviteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Invite team members`)
};

const es_getting_started_invite = /** @type {(inputs: Getting_Started_InviteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Invitar miembros del equipo`)
};

const en_xa2_getting_started_invite = /** @type {(inputs: Getting_Started_InviteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ìnvìtè tèàm mèmbèrs ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Invite team members" |
*
* @param {Getting_Started_InviteInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const getting_started_invite = /** @type {((inputs?: Getting_Started_InviteInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Getting_Started_InviteInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_getting_started_invite(inputs)
	if (locale === "en-XA") return en_xa2_getting_started_invite(inputs)
	return en_getting_started_invite(inputs)
});