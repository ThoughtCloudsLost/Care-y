/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Exposure_Hints_BodyInputs */

const en_demo_narrative_topic_exposure_hints_body = /** @type {(inputs: Demo_Narrative_Topic_Exposure_Hints_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`When the user initiates an SMS reply or a phone call from a ticket, a brief notice appears reminding them that the channel is not encrypted.
**SMS warning.** "SMS is not encrypted and your phone provider can read it. Keep sensitive details in the encrypted chat."
**Call warning.** "This call routes through your phone provider and they can hear the call. Keep sensitive details in the encrypted chat."
**Frequency.** Each warning appears once per session, and after the user dismisses it the same warning does not reappear until the page is reloaded, so the warnings are informational and never block the action.
**Email.** Email warnings work differently from SMS and call warnings. Composing an email opens a distinct compose sheet rather than the standard message input, and because this surface is specific to email it carries a persistent warning banner above the editor rather than a one time notice, since the separate sheet itself signals the user is doing something different from sending an encrypted message.`)
};

const es_demo_narrative_topic_exposure_hints_body = /** @type {(inputs: Demo_Narrative_Topic_Exposure_Hints_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cuando el usuario inicia una respuesta por SMS o una llamada telefónica desde un ticket, aparece un breve aviso recordándole que el canal no está cifrado.
**Aviso de SMS.** "El SMS no está cifrado y tu proveedor de telefonía puede leerlo. Mantén los detalles sensibles en el chat cifrado."
**Aviso de llamada.** "Esta llamada pasa por tu proveedor de telefonía y pueden escuchar la llamada. Mantén los detalles sensibles en el chat cifrado."
**Frecuencia.** Cada aviso aparece una vez por sesión, y después de que el usuario lo descarta el mismo aviso no vuelve a aparecer hasta que se recarga la página, por lo que los avisos son informativos y nunca bloquean la acción.
**Correo electrónico.** Los avisos de correo electrónico funcionan de forma diferente a los de SMS y llamada. Componer un correo abre una hoja de composición diferente del campo de mensaje estándar, y como esta superficie es específica del correo lleva un banner de advertencia permanente sobre el editor en lugar de un aviso de una sola vez, ya que la hoja separada señala que el usuario está haciendo algo distinto a enviar un mensaje cifrado.`)
};

const en_xa2_demo_narrative_topic_exposure_hints_body = /** @type {(inputs: Demo_Narrative_Topic_Exposure_Hints_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Whèn thè ùsèr ìnìtìàtès àn SMS rèply òr à phònè càll fròm à tìckèt, à brìèf nòtìcè àppèàrs rèmìndìng thèm thàt thè chànnèl ìs nòt èncryptèd.
 •••••••••••••••••••••••••••••••••••••••••••**SMS wàrnìng. ••••** "SMS ìs nòt èncryptèd ànd yòùr phònè pròvìdèr càn rèàd ìt. Kèèp sènsìtìvè dètàìls ìn thè èncryptèd chàt."
 •••••••••••••••••••••••••••••••••**Càll wàrnìng. ••••** "Thìs càll ròùtès thròùgh yòùr phònè pròvìdèr ànd thèy càn hèàr thè càll. Kèèp sènsìtìvè dètàìls ìn thè èncryptèd chàt."
 •••••••••••••••••••••••••••••••••••••**Frèqùèncy. •••** Èàch wàrnìng àppèàrs òncè pèr sèssìòn, ànd àftèr thè ùsèr dìsmìssès ìt thè sàmè wàrnìng dòès nòt rèàppèàr ùntìl thè pàgè ìs rèlòàdèd, sò thè wàrnìngs àrè ìnfòrmàtìònàl ànd nèvèr blòck thè àctìòn.
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Èmàìl. ••** Èmàìl wàrnìngs wòrk dìffèrèntly fròm SMS ànd càll wàrnìngs. Còmpòsìng àn èmàìl òpèns à dìstìnct còmpòsè shèèt ràthèr thàn thè stàndàrd mèssàgè ìnpùt, ànd bècàùsè thìs sùrfàcè ìs spècìfìc tò èmàìl ìt càrrìès à pèrsìstènt wàrnìng bànnèr àbòvè thè èdìtòr ràthèr thàn à ònè tìmè nòtìcè, sìncè thè sèpàràtè shèèt ìtsèlf sìgnàls thè ùsèr ìs dòìng sòmèthìng dìffèrènt fròm sèndìng àn èncryptèd mèssàgè. •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "When the user initiates an SMS reply or a phone call from a ticket, a brief notice appears reminding them that the channel is not encrypted. **SMS warning.**..." |
*
* @param {Demo_Narrative_Topic_Exposure_Hints_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_exposure_hints_body = /** @type {((inputs?: Demo_Narrative_Topic_Exposure_Hints_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Exposure_Hints_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_exposure_hints_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_exposure_hints_body(inputs)
	return en_demo_narrative_topic_exposure_hints_body(inputs)
});