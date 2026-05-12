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

/**
* | output |
* | --- |
* | "Invite team members" |
*
* @param {Getting_Started_InviteInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const getting_started_invite = /** @type {((inputs?: Getting_Started_InviteInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Getting_Started_InviteInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_getting_started_invite(inputs)
	return es_getting_started_invite(inputs)
});