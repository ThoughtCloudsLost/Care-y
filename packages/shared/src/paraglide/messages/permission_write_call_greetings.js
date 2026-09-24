/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Permission_Write_Call_GreetingsInputs */

const en_permission_write_call_greetings = /** @type {(inputs: Permission_Write_Call_GreetingsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Write call greetings`)
};

const es_permission_write_call_greetings = /** @type {(inputs: Permission_Write_Call_GreetingsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Escribir saludos de llamada`)
};

const en_xa2_permission_write_call_greetings = /** @type {(inputs: Permission_Write_Call_GreetingsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Wrìtè càll grèètìngs ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Write call greetings" |
*
* @param {Permission_Write_Call_GreetingsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const permission_write_call_greetings = /** @type {((inputs?: Permission_Write_Call_GreetingsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_Write_Call_GreetingsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_permission_write_call_greetings(inputs)
	if (locale === "en-XA") return en_xa2_permission_write_call_greetings(inputs)
	return en_permission_write_call_greetings(inputs)
});