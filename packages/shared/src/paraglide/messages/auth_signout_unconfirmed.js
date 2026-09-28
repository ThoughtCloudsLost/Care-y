/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Signout_UnconfirmedInputs */

const en_auth_signout_unconfirmed = /** @type {(inputs: Auth_Signout_UnconfirmedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`You are signed out on this device, but the server did not confirm it. The session will end on its own within a day.`)
};

const es_auth_signout_unconfirmed = /** @type {(inputs: Auth_Signout_UnconfirmedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Se cerró tu sesión en este dispositivo, pero el servidor no lo confirmó. La sesión terminará por sí sola en un plazo de un día.`)
};

const en_xa2_auth_signout_unconfirmed = /** @type {(inputs: Auth_Signout_UnconfirmedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Yòù àrè sìgnèd òùt òn thìs dèvìcè, bùt thè sèrvèr dìd nòt cònfìrm ìt. Thè sèssìòn wìll ènd òn ìts òwn wìthìn à dày. •••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "You are signed out on this device, but the server did not confirm it. The session will end on its own within a day." |
*
* @param {Auth_Signout_UnconfirmedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const auth_signout_unconfirmed = /** @type {((inputs?: Auth_Signout_UnconfirmedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Signout_UnconfirmedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_auth_signout_unconfirmed(inputs)
	if (locale === "en-XA") return en_xa2_auth_signout_unconfirmed(inputs)
	return en_auth_signout_unconfirmed(inputs)
});