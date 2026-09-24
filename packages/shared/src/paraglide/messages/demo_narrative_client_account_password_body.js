/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Client_Account_Password_BodyInputs */

const en_demo_narrative_client_account_password_body = /** @type {(inputs: Demo_Narrative_Client_Account_Password_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Changing the password ends every other active session and keeps the client's message history, and the new password must be at least 8 characters.
**How it works.** The browser sends the current password's derived auth token to the server for verification, derives new keys from the new password through the same deliberately slow pipeline used at sign in, re-wraps the account's key material under the new keys, and terminates all other active sessions in a single server call, with a progress indicator appearing during the derivation steps.
**What survives.** The browser re-encrypts message copies the client can still decrypt under the new credentials, and anything already unreadable on that device stays that way, so nothing readable is lost. A forgot password reset is a different and destructive path where a user mediates the process. The account, its message copies, and the channel are removed, the communication tier drops back to SMS and email, and there is no other way to recover a forgotten password.`)
};

const es_demo_narrative_client_account_password_body = /** @type {(inputs: Demo_Narrative_Client_Account_Password_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cambiar la contraseña finaliza todas las demás sesiones activas y conserva el historial de mensajes del cliente, y la nueva contraseña debe tener al menos 8 caracteres.
**Cómo funciona.** El navegador envía al servidor el token de autenticación derivado de la contraseña actual para su verificación, deriva nuevas claves de la nueva contraseña a través del mismo proceso deliberadamente lento que se usa al iniciar sesión, re-envuelve el material de claves de la cuenta bajo las nuevas claves y termina todas las demás sesiones activas en una sola llamada al servidor, con un indicador de progreso durante los pasos de derivación.
**Qué sobrevive.** El navegador re-cifra las copias de mensajes que el cliente aún puede descifrar bajo las nuevas credenciales, y lo que ya era ilegible en ese dispositivo sigue siéndolo, de modo que nada legible se pierde. El restablecimiento por contraseña olvidada es una ruta diferente y destructiva donde la persona usuaria media el proceso. La cuenta, sus copias de mensajes y el canal se eliminan, el nivel de comunicación vuelve a SMS y correo, y no existe otra forma de recuperar una contraseña olvidada.`)
};

const en_xa2_demo_narrative_client_account_password_body = /** @type {(inputs: Demo_Narrative_Client_Account_Password_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Chàngìng thè pàsswòrd ènds èvèry òthèr àctìvè sèssìòn ànd kèèps thè clìènt's mèssàgè hìstòry, ànd thè nèw pàsswòrd mùst bè àt lèàst 8 chàràctèrs.
 ••••••••••••••••••••••••••••••••••••••••••••**Hòw ìt wòrks. ••••** Thè bròwsèr sènds thè cùrrènt pàsswòrd's dèrìvèd àùth tòkèn tò thè sèrvèr fòr vèrìfìcàtìòn, dèrìvès nèw kèys fròm thè nèw pàsswòrd thròùgh thè sàmè dèlìbèràtèly slòw pìpèlìnè ùsèd àt sìgn ìn, rè-wràps thè àccòùnt's kèy màtèrìàl ùndèr thè nèw kèys, ànd tèrmìnàtès àll òthèr àctìvè sèssìòns ìn à sìnglè sèrvèr càll, wìth à prògrèss ìndìcàtòr àppèàrìng dùrìng thè dèrìvàtìòn stèps.
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt sùrvìvès. •••••** Thè bròwsèr rè-èncrypts mèssàgè còpìès thè clìènt càn stìll dècrypt ùndèr thè nèw crèdèntìàls, ànd ànythìng àlrèàdy ùnrèàdàblè òn thàt dèvìcè stàys thàt wày, sò nòthìng rèàdàblè ìs lòst. À fòrgòt pàsswòrd rèsèt ìs à dìffèrènt ànd dèstrùctìvè pàth whèrè à ùsèr mèdìàtès thè pròcèss. Thè àccòùnt, ìts mèssàgè còpìès, ànd thè chànnèl àrè rèmòvèd, thè còmmùnìcàtìòn tìèr dròps bàck tò SMS ànd èmàìl, ànd thèrè ìs nò òthèr wày tò rècòvèr à fòrgòttèn pàsswòrd. •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Changing the password ends every other active session and keeps the client's message history, and the new password must be at least 8 characters. **How it wo..." |
*
* @param {Demo_Narrative_Client_Account_Password_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_client_account_password_body = /** @type {((inputs?: Demo_Narrative_Client_Account_Password_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Client_Account_Password_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_client_account_password_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_client_account_password_body(inputs)
	return en_demo_narrative_client_account_password_body(inputs)
});