/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Password_DescInputs */

const en_onboarding_password_desc = /** @type {(inputs: Onboarding_Password_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`An administrator set the temporary password you signed in with. The keys that protect your account are derived from your password, so choose your own now.`)
};

const es_onboarding_password_desc = /** @type {(inputs: Onboarding_Password_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Un administrador estableció la contraseña temporal con la que iniciaste sesión. Las claves que protegen tu cuenta se derivan de tu contraseña, así que elige la tuya ahora.`)
};

const en_xa2_onboarding_password_desc = /** @type {(inputs: Onboarding_Password_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àn àdmìnìstràtòr sèt thè tèmpòràry pàsswòrd yòù sìgnèd ìn wìth. Thè kèys thàt pròtèct yòùr àccòùnt àrè dèrìvèd fròm yòùr pàsswòrd, sò chòòsè yòùr òwn nòw. •••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "An administrator set the temporary password you signed in with. The keys that protect your account are derived from your password, so choose your own now." |
*
* @param {Onboarding_Password_DescInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_password_desc = /** @type {((inputs?: Onboarding_Password_DescInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Password_DescInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_password_desc(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_password_desc(inputs)
	return en_onboarding_password_desc(inputs)
});